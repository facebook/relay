/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::match_::hash_supported_argument;

use super::*;
use common::{sync::try_join, DiagnosticsResult, FeatureFlags, PerfLogEvent, PerfLogger};
use fnv::FnvHashSet;
use graphql_ir::Program;
use intern::string_key::StringKey;
use regex::Regex;
use std::sync::Arc;

#[derive(Debug)]
pub struct Programs {
    pub source: Arc<Program>,
    pub reader: Arc<Program>,
    pub normalization: Arc<Program>,
    pub operation_text: Arc<Program>,
    pub typegen: Arc<Program>,
}

pub fn apply_transforms<TPerfLogger>(
    project_name: StringKey,
    program: Arc<Program>,
    base_fragment_names: Arc<FnvHashSet<StringKey>>,
    connection_interface: &ConnectionInterface,
    feature_flags: Arc<FeatureFlags>,
    test_path_regex: &Option<Regex>,
    perf_logger: Arc<TPerfLogger>,
    print_stats: Option<fn(extra_info: &'static str, program: &Program) -> ()>,
) -> DiagnosticsResult<Programs>
where
    TPerfLogger: PerfLogger + 'static,
{
    // The execution pipeline is as follows, where items at the same indentation
    // can be computed independently and therefore in parallel:
    // |- common
    //    |- reader
    //    |- operation
    //       |- normalization
    //       |- operation_text
    // |- typegen
    //
    // NOTE: try_join(f1, f2) prefers the errors from f1 over f2, so process the normalization
    // program first since it is likely to include more errors (both per-fragment and
    // whole-operation errors) than the reader_program which just includes per-fragment errors.
    let (((normalization_program, text_program), reader_program), typegen_program) = try_join(
        || {
            let common_program = apply_common_transforms(
                project_name,
                Arc::clone(&program),
                connection_interface,
                Arc::clone(&feature_flags),
                Arc::clone(&base_fragment_names),
                Arc::clone(&perf_logger),
            )?;

            try_join(
                || {
                    let operation_program = apply_operation_transforms(
                        project_name,
                        Arc::clone(&common_program),
                        connection_interface,
                        Arc::clone(&base_fragment_names),
                        Arc::clone(&perf_logger),
                    )?;

                    try_join(
                        || {
                            apply_normalization_transforms(
                                project_name,
                                Arc::clone(&operation_program),
                                Arc::clone(&base_fragment_names),
                                Arc::clone(&feature_flags),
                                test_path_regex.clone(),
                                Arc::clone(&perf_logger),
                                print_stats,
                            )
                        },
                        || {
                            apply_operation_text_transforms(
                                project_name,
                                Arc::clone(&operation_program),
                                Arc::clone(&base_fragment_names),
                                Arc::clone(&feature_flags),
                                Arc::clone(&perf_logger),
                            )
                        },
                    )
                },
                || {
                    apply_reader_transforms(
                        project_name,
                        Arc::clone(&common_program),
                        Arc::clone(&feature_flags),
                        Arc::clone(&base_fragment_names),
                        Arc::clone(&perf_logger),
                    )
                },
            )
        },
        || {
            apply_typegen_transforms(
                project_name,
                Arc::clone(&program),
                Arc::clone(&feature_flags),
                Arc::clone(&base_fragment_names),
                Arc::clone(&perf_logger),
            )
        },
    )?;

    Ok(Programs {
        source: program,
        reader: reader_program,
        normalization: normalization_program,
        operation_text: text_program,
        typegen: typegen_program,
    })
}

/// Applies transforms that apply to every output.
fn apply_common_transforms(
    project_name: StringKey,
    program: Arc<Program>,
    connection_interface: &ConnectionInterface,
    feature_flags: Arc<FeatureFlags>,
    base_fragment_names: Arc<FnvHashSet<StringKey>>,
    perf_logger: Arc<impl PerfLogger>,
) -> DiagnosticsResult<Arc<Program>> {
    let log_event = perf_logger.create_event("apply_common_transforms");
    log_event.string("project", project_name.to_string());
    let mut program = log_event.time("transform_connections", || {
        transform_connections(&program, connection_interface)
    });
    program = log_event.time("mask", || mask(&program));
    program = log_event.time("transform_defer_stream", || {
        transform_defer_stream(&program)
    })?;
    program = log_event.time("transform_match", || {
        transform_match(&program, &feature_flags)
    })?;
    program = log_event.time("transform_subscriptions", || {
        transform_subscriptions(&program)
    })?;
    program = log_event.time("transform_refetchable_fragment", || {
        transform_refetchable_fragment(&program, &base_fragment_names, false)
    })?;

    program = log_event.time("client_edges", || client_edges(&program))?;

    program = log_event.time("relay_resolvers", || {
        relay_resolvers(&program, feature_flags.enable_relay_resolver_transform)
    })?;

    if feature_flags.enable_flight_transform {
        program = log_event.time("react_flight", || react_flight(&program))?;
        program = log_event.time("relay_client_component", || {
            relay_client_component(&program, &feature_flags)
        })?;
    }

    program = log_event.time("relay_actor_change_transform", || {
        relay_actor_change_transform(&program, &feature_flags.actor_change_support)
    })?;

    program = log_event.time("provided_variable_fragment_transform", || {
        provided_variable_fragment_transform(&program)
    });

    log_event.complete();

    Ok(Arc::new(program))
}

/// Applies transforms only for generated reader code.
/// Corresponds to the "fragment transforms" in the JS compiler.
fn apply_reader_transforms(
    project_name: StringKey,
    program: Arc<Program>,
    feature_flags: Arc<FeatureFlags>,
    base_fragment_names: Arc<FnvHashSet<StringKey>>,
    perf_logger: Arc<impl PerfLogger>,
) -> DiagnosticsResult<Arc<Program>> {
    let log_event = perf_logger.create_event("apply_reader_transforms");
    log_event.string("project", project_name.to_string());
    let mut program = log_event.time("required_directive", || {
        required_directive(&program, &feature_flags)
    })?;

    program = log_event.time("client_extensions", || client_extensions(&program));
    program = log_event.time("handle_field_transform", || {
        handle_field_transform(&program)
    });

    program = log_event.time("transform_assignable_fragment_spreads", || {
        transform_assignable_fragment_spreads(&program)
    })?;

    program = log_event.time("inline_data_fragment", || inline_data_fragment(&program))?;
    program = log_event.time("skip_unreachable_node", || skip_unreachable_node(&program))?;
    program = log_event.time("remove_base_fragments", || {
        remove_base_fragments(&program, base_fragment_names)
    });

    log_event.time("flatten", || flatten(&mut program, true, false))?;
    program = log_event.time("skip_redundant_nodes", || skip_redundant_nodes(&program));
    program = log_event.time("generate_data_driven_dependency_metadata", || {
        generate_data_driven_dependency_metadata(&program)
    });
    program = log_event.time("hash_supported_argument", || {
        hash_supported_argument(&program, &feature_flags)
    })?;

    log_event.complete();

    Ok(Arc::new(program))
}

/// Applies transforms that apply to all operation artifacts.
/// Corresponds to the "query transforms" in the JS compiler.
fn apply_operation_transforms(
    project_name: StringKey,
    program: Arc<Program>,
    connection_interface: &ConnectionInterface,
    base_fragment_names: Arc<FnvHashSet<StringKey>>,
    perf_logger: Arc<impl PerfLogger>,
) -> DiagnosticsResult<Arc<Program>> {
    let log_event = perf_logger.create_event("apply_operation_transforms");
    log_event.string("project", project_name.to_string());

    let mut program = log_event.time("preserve_client_edge_backing_ids", || {
        preserve_client_edge_backing_ids(&program)
    })?;

    program = log_event.time("split_module_import", || {
        split_module_import(&program, &base_fragment_names)
    });
    program = log_event.time("generate_id_field", || generate_id_field(&program));
    program = log_event.time("declarative_connection", || {
        transform_declarative_connection(&program, connection_interface)
    })?;

    // TODO(T67052528): execute FB-specific transforms only if config options is provided
    program = log_event.time("generate_subscription_name_metadata", || {
        generate_subscription_name_metadata(&program)
    })?;
    program = log_event.time("generate_live_query_metadata", || {
        generate_live_query_metadata(&program)
    })?;

    log_event.complete();

    Ok(Arc::new(program))
}

/// After the operation transforms, this applies further transforms that only
/// apply to the generated normalization code.
///
/// Corresponds to the "codegen transforms" in the JS compiler
fn apply_normalization_transforms(
    project_name: StringKey,
    program: Arc<Program>,
    base_fragment_names: Arc<FnvHashSet<StringKey>>,
    feature_flags: Arc<FeatureFlags>,
    test_path_regex: Option<Regex>,
    perf_logger: Arc<impl PerfLogger>,
    maybe_print_stats: Option<fn(extra_info: &'static str, program: &Program) -> ()>,
) -> DiagnosticsResult<Arc<Program>> {
    let log_event = perf_logger.create_event("apply_normalization_transforms");
    log_event.string("project", project_name.to_string());
    if let Some(print_stats) = maybe_print_stats {
        print_stats("normalization start", &program);
    }

    let mut program = log_event.time("apply_fragment_arguments", || {
        apply_fragment_arguments(
            &program,
            true,
            &feature_flags.no_inline,
            &base_fragment_names,
        )
    })?;
    if let Some(print_stats) = maybe_print_stats {
        print_stats("apply_fragment_arguments", &program);
    }

    program = log_event.time("hash_supported_argument", || {
        hash_supported_argument(&program, &feature_flags)
    })?;
    if let Some(print_stats) = maybe_print_stats {
        print_stats("hash_supported_argument", &program);
    }

    program = log_event.time("skip_unreachable_node", || skip_unreachable_node(&program))?;
    if let Some(print_stats) = maybe_print_stats {
        print_stats("skip_unreachable_node", &program);
    }

    program = log_event.time("inline_fragments", || inline_fragments(&program));
    if let Some(print_stats) = maybe_print_stats {
        print_stats("inline_fragments", &program);
    }

    program = log_event.time("client_extensions", || client_extensions(&program));
    if let Some(print_stats) = maybe_print_stats {
        print_stats("client_extensions", &program);
    }

    program = log_event.time("generate_typename", || generate_typename(&program, true));
    if let Some(print_stats) = maybe_print_stats {
        print_stats("generate_typename", &program);
    }

    log_event.time("flatten", || flatten(&mut program, true, false))?;
    if let Some(print_stats) = maybe_print_stats {
        print_stats("flatten", &program);
    }

    program = log_event.time("skip_redundant_nodes", || skip_redundant_nodes(&program));
    if let Some(print_stats) = maybe_print_stats {
        print_stats("skip_redundant_nodes", &program);
    }

    program = log_event.time("generate_test_operation_metadata", || {
        generate_test_operation_metadata(&program, &test_path_regex)
    })?;
    if let Some(print_stats) = maybe_print_stats {
        print_stats("generate_test_operation_metadata", &program);
    }

    log_event.complete();

    Ok(Arc::new(program))
}

/// After the operation transforms, this applies further transforms that only
/// apply to the printed operation text.
///
/// Corresponds to the "print transforms" in the JS compiler
fn apply_operation_text_transforms(
    project_name: StringKey,
    program: Arc<Program>,
    base_fragment_names: Arc<FnvHashSet<StringKey>>,
    feature_flags: Arc<FeatureFlags>,
    perf_logger: Arc<impl PerfLogger>,
) -> DiagnosticsResult<Arc<Program>> {
    let log_event = perf_logger.create_event("apply_operation_text_transforms");
    log_event.string("project", project_name.to_string());

    let mut program = log_event.time("apply_fragment_arguments", || {
        apply_fragment_arguments(
            &program,
            false,
            &feature_flags.no_inline,
            &base_fragment_names,
        )
    })?;
    log_event.time("validate_global_variables", || {
        validate_global_variables(&program)
    })?;
    program = log_event.time("skip_split_operation", || skip_split_operation(&program));
    program = log_event.time("skip_client_extensions", || {
        skip_client_extensions(&program)
    });
    program = log_event.time("skip_unreachable_node", || skip_unreachable_node(&program))?;
    program = log_event.time("generate_typename", || generate_typename(&program, false));
    program = log_event.time("skip_null_arguments_transform", || {
        skip_null_arguments_transform(&program)
    });
    log_event.time("validate_selection_conflict", || {
        validate_selection_conflict(&program)
    })?;
    log_event.time("flatten", || flatten(&mut program, false, true))?;
    program = log_event.time("validate_operation_variables", || {
        validate_operation_variables(&program)
    })?;
    program = log_event.time("skip_client_directives", || {
        skip_client_directives(&program)
    });
    log_event.time("validate_required_arguments", || {
        validate_required_arguments(&program)
    })?;
    program = log_event.time("unwrap_custom_directive_selection", || {
        unwrap_custom_directive_selection(&program)
    });

    log_event.complete();

    Ok(Arc::new(program))
}

fn apply_typegen_transforms(
    project_name: StringKey,
    program: Arc<Program>,
    feature_flags: Arc<FeatureFlags>,
    base_fragment_names: Arc<FnvHashSet<StringKey>>,
    perf_logger: Arc<impl PerfLogger>,
) -> DiagnosticsResult<Arc<Program>> {
    let log_event = perf_logger.create_event("apply_typegen_transforms");
    log_event.string("project", project_name.to_string());

    let mut program = log_event.time("mask", || mask(&program));
    program = log_event.time("transform_match", || {
        transform_match(&program, &feature_flags)
    })?;
    program = log_event.time("transform_subscriptions", || {
        transform_subscriptions(&program)
    })?;
    program = log_event.time("required_directive", || {
        required_directive(&program, &feature_flags)
    })?;
    program = log_event.time("client_edges", || client_edges(&program))?;
    program = log_event.time("transform_assignable_fragment_spreads", || {
        transform_assignable_fragment_spreads(&program)
    })?;
    program = log_event.time("relay_resolvers", || {
        relay_resolvers(&program, feature_flags.enable_relay_resolver_transform)
    })?;
    program = log_event.time("preserve_client_edge_selections", || {
        preserve_client_edge_selections(&program)
    })?;
    log_event.time("flatten", || flatten(&mut program, false, false))?;
    program = log_event.time("transform_refetchable_fragment", || {
        transform_refetchable_fragment(&program, &base_fragment_names, true)
    })?;
    program = log_event.time("remove_base_fragments", || {
        remove_base_fragments(&program, base_fragment_names)
    });

    program = log_event.time("relay_actor_change_transform", || {
        relay_actor_change_transform(&program, &feature_flags.actor_change_support)
    })?;

    log_event.complete();

    Ok(Arc::new(program))
}
