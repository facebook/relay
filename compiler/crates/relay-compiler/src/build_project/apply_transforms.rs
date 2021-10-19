/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{DiagnosticsResult, PerfLogEvent, PerfLogger};
use fnv::FnvHashSet;
use graphql_ir::Program;
use interner::StringKey;
use relay_transforms::*;
use std::sync::Arc;

use super::log_program_stats::print_stats;

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
    perf_logger: Arc<TPerfLogger>,
) -> DiagnosticsResult<Programs>
where
    TPerfLogger: PerfLogger + 'static,
{
    // The execution pipeline is as follows, where items at the same indentation
    // can be computed independently and therefore in parallel:
    // |- common
    //  |- reader
    //  |- operation
    //     |- normalization
    //     |- operation_text
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
                                Arc::clone(&perf_logger),
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
    program = log_event.time("transform_match", || transform_match(&program))?;
    program = log_event.time("transform_refetchable_fragment", || {
        transform_refetchable_fragment(&program, &base_fragment_names, false)
    })?;
    if feature_flags.enable_flight_transform {
        program = log_event.time("react_flight", || react_flight(&program))?;
        program = log_event.time("relay_client_component", || {
            relay_client_component(&program)
        })?;
    }
    perf_logger.complete_event(log_event);

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
    program = log_event.time("inline_data_fragment", || inline_data_fragment(&program))?;
    program = log_event.time("remove_base_fragments", || {
        remove_base_fragments(&program, base_fragment_names)
    });
    log_event.time("flatten", || flatten(&mut program, true))?;
    program = log_event.time("skip_redundant_nodes", || skip_redundant_nodes(&program));
    program = log_event.time("generate_data_driven_dependency_metadata", || {
        generate_data_driven_dependency_metadata(&program)
    });

    perf_logger.complete_event(log_event);

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

    let mut program = log_event.time("split_module_import", || {
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

    perf_logger.complete_event(log_event);

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
    perf_logger: Arc<impl PerfLogger>,
) -> DiagnosticsResult<Arc<Program>> {
    let log_event = perf_logger.create_event("apply_normalization_transforms");
    log_event.string("project", project_name.to_string());
    print_stats("normalization start", &program);

    let mut program = log_event.time("apply_fragment_arguments", || {
        apply_fragment_arguments(
            &program,
            true,
            &feature_flags.no_inline,
            &base_fragment_names,
        )
    })?;
    print_stats("apply_fragment_arguments", &program);
    program = log_event.time("relay_early_flush", || relay_early_flush(&program))?;
    print_stats("relay_early_flush", &program);

    program = log_event.time("skip_unreachable_node", || skip_unreachable_node(&program));
    print_stats("skip_unreachable_node", &program);

    program = log_event.time("inline_fragments", || inline_fragments(&program));
    print_stats("inline_fragments", &program);

    program = log_event.time("client_extensions", || client_extensions(&program));
    print_stats("client_extensions", &program);

    program = log_event.time("generate_typename", || generate_typename(&program, true));
    print_stats("generate_typename", &program);

    log_event.time("flatten", || flatten(&mut program, true))?;
    print_stats("flatten", &program);

    program = log_event.time("skip_redundant_nodes", || skip_redundant_nodes(&program));
    print_stats("skip_redundant_nodes", &program);

    program = log_event.time("generate_test_operation_metadata", || {
        generate_test_operation_metadata(&program)
    });
    print_stats("generate_test_operation_metadata", &program);

    perf_logger.complete_event(log_event);

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
    program = log_event.time("relay_early_flush", || relay_early_flush(&program))?;
    program = log_event.time("skip_split_operation", || skip_split_operation(&program));
    program = log_event.time("skip_client_extensions", || {
        skip_client_extensions(&program)
    });
    program = log_event.time("skip_unreachable_node", || skip_unreachable_node(&program));
    program = log_event.time("generate_typename", || generate_typename(&program, false));
    log_event.time("flatten", || flatten(&mut program, false))?;
    program = log_event.time("skip_unused_variables", || skip_unused_variables(&program));
    program = log_event.time("skip_client_directives", || {
        skip_client_directives(&program)
    });
    log_event.time("validate_required_arguments", || {
        validate_required_arguments(&program)
    })?;
    program = log_event.time("unwrap_custom_directive_selection", || {
        unwrap_custom_directive_selection(&program)
    });
    perf_logger.complete_event(log_event);

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
    program = log_event.time("transform_match", || transform_match(&program))?;
    program = log_event.time("required_directive", || {
        required_directive(&program, &feature_flags)
    })?;
    log_event.time("flatten", || flatten(&mut program, false))?;
    program = log_event.time("transform_refetchable_fragment", || {
        transform_refetchable_fragment(&program, &base_fragment_names, true)
    })?;
    program = log_event.time("remove_base_fragments", || {
        remove_base_fragments(&program, base_fragment_names)
    });
    perf_logger.complete_event(log_event);

    Ok(Arc::new(program))
}

fn try_join<T1, F1, T2, F2, E>(f1: F1, f2: F2) -> Result<(T1, T2), Vec<E>>
where
    F1: FnOnce() -> Result<T1, Vec<E>> + Send,
    F2: FnOnce() -> Result<T2, Vec<E>> + Send,
    T1: Send,
    T2: Send,
    E: Send,
{
    let (v1, v2) = rayon::join(f1, f2);
    Ok((v1?, v2?))
}
