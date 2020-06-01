/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{PerfLogEvent, PerfLogger};
use fnv::FnvHashSet;
use graphql_ir::{Program, ValidationResult};
use graphql_transforms::{
    apply_fragment_arguments, client_extensions, dedupe_type_discriminator, flatten,
    generate_id_field, generate_live_query_metadata, generate_preloadable_metadata,
    generate_subscription_name_metadata, generate_typename, handle_field_transform,
    inline_data_fragment, inline_fragments, mask, relay_early_flush, remove_base_fragments,
    skip_client_extensions, skip_redundant_nodes, skip_split_operation, skip_unreachable_node,
    skip_unused_variables, split_module_import, transform_connections, transform_defer_stream,
    transform_match, transform_refetchable_fragment, unwrap_custom_directive_selection,
    validate_module_conflicts, ConnectionInterface,
};
use interner::StringKey;
use std::sync::Arc;

pub struct Programs {
    pub source: Arc<Program>,
    pub reader: Arc<Program>,
    pub normalization: Arc<Program>,
    pub operation_text: Arc<Program>,
    pub typegen: Arc<Program>,
}

pub fn apply_transforms(
    project_name: &str,
    program: Arc<Program>,
    base_fragment_names: Arc<FnvHashSet<StringKey>>,
    connection_interface: Arc<ConnectionInterface>,
    perf_logger: Arc<impl PerfLogger>,
) -> ValidationResult<Programs> {
    // common
    //  |- reader
    //  |- operation
    //     |- normalization
    //     |- operation_text
    // typegen
    let common_program = apply_common_transforms(
        project_name,
        Arc::clone(&program),
        connection_interface,
        Arc::clone(&base_fragment_names),
        Arc::clone(&perf_logger),
    )?;
    let reader_program = apply_reader_transforms(
        project_name,
        Arc::clone(&common_program),
        Arc::clone(&base_fragment_names),
        Arc::clone(&perf_logger),
    )?;
    let operation_program = apply_operation_transforms(
        project_name,
        common_program,
        Arc::clone(&base_fragment_names),
        Arc::clone(&perf_logger),
    )?;
    let normalization_program = apply_normalization_transforms(
        project_name,
        Arc::clone(&operation_program),
        Arc::clone(&perf_logger),
    )?;
    let operation_text_program =
        apply_operation_text_transforms(project_name, operation_program, Arc::clone(&perf_logger))?;
    let typegen_program = apply_typegen_transforms(
        project_name,
        Arc::clone(&program),
        Arc::clone(&base_fragment_names),
        Arc::clone(&perf_logger),
    )?;

    Ok(Programs {
        source: program,
        reader: reader_program,
        normalization: normalization_program,
        operation_text: operation_text_program,
        typegen: typegen_program,
    })
}

/// Applies transforms that apply to every output.
fn apply_common_transforms(
    project_name: &str,
    program: Arc<Program>,
    connection_interface: Arc<ConnectionInterface>,
    base_fragment_names: Arc<FnvHashSet<StringKey>>,
    perf_logger: Arc<impl PerfLogger>,
) -> ValidationResult<Arc<Program>> {
    // JS compiler
    // * DisallowIdAsAlias (in validate)
    // + ConnectionTransform
    // * RelayDirectiveTransform (in validate)
    // + MaskTransform
    // + MatchTransform
    // + RefetchableFragmentTransform
    // + DeferStreamTransform
    let log_event = perf_logger.create_event("apply_common_transforms");
    log_event.string("project", project_name.to_string());
    let program = log_event.time("transform_connections", || {
        transform_connections(&program, connection_interface)
    });
    let program = log_event.time("mask", || mask(&program));
    let program = log_event.time("transform_match", || transform_match(&program))?;
    let program = log_event.time("transform_defer_stream", || {
        transform_defer_stream(&program)
    })?;
    let program = log_event.time("transform_refetchable_fragment", || {
        transform_refetchable_fragment(&program, &base_fragment_names, false)
    })?;
    perf_logger.complete_event(log_event);

    Ok(Arc::new(program))
}

/// Applies transforms only for generated reader code.
/// Corresponds to the "fragment transforms" in the JS compiler.
fn apply_reader_transforms(
    project_name: &str,
    program: Arc<Program>,
    base_fragment_names: Arc<FnvHashSet<StringKey>>,
    perf_logger: Arc<impl PerfLogger>,
) -> ValidationResult<Arc<Program>> {
    // JS compiler
    // + ClientExtensionsTransform
    // + FieldHandleTransform
    // + InlineDataFragmentTransform
    // + FlattenTransform, flattenAbstractTypes: true
    // + SkipRedundantNodesTransform
    let log_event = perf_logger.create_event("apply_reader_transforms");
    log_event.string("project", project_name.to_string());

    let program = log_event.time("client_extensions", || client_extensions(&program));
    let program = log_event.time("handle_field_transform", || {
        handle_field_transform(&program)
    });
    let program = log_event.time("inline_data_fragment", || inline_data_fragment(&program))?;
    let program = log_event.time("remove_base_fragments", || {
        remove_base_fragments(&program, base_fragment_names)
    });
    let program = log_event.time("flatten", || flatten(&program, true));
    let program = log_event.time("skip_redundant_nodes", || skip_redundant_nodes(&program));

    perf_logger.complete_event(log_event);

    Ok(Arc::new(program))
}

/// Applies transforms that apply to all operation artifacts.
/// Corresponds to the "query transforms" in the JS compiler.
fn apply_operation_transforms(
    project_name: &str,
    program: Arc<Program>,
    base_fragment_names: Arc<FnvHashSet<StringKey>>,
    perf_logger: Arc<impl PerfLogger>,
) -> ValidationResult<Arc<Program>> {
    // JS compiler
    // + SplitModuleImportTransform
    // * ValidateUnusedVariablesTransform (Moved to common_transforms)
    // + ApplyFragmentArgumentTransform
    // - ValidateGlobalVariablesTransform
    // + GenerateIDFieldTransform
    // * TestOperationTransform - part of relay_codegen
    let log_event = perf_logger.create_event("apply_operation_transforms");
    log_event.string("project", project_name.to_string());

    let program = log_event.time("split_module_import", || {
        split_module_import(&program, &base_fragment_names)
    });
    let program = log_event.time("apply_fragment_arguments", || {
        apply_fragment_arguments(&program)
    })?;
    let program = log_event.time("generate_id_field", || generate_id_field(&program));

    // TODO(T67052528): execute FB-specific transforms only if config options is provided
    let program = log_event.time("generate_preloadable_metadata", || {
        generate_preloadable_metadata(&program)
    });
    let program = log_event.time("generate_subscription_name_metadata", || {
        generate_subscription_name_metadata(&program)
    })?;
    let program = log_event.time("generate_live_query_metadata", || {
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
    project_name: &str,
    program: Arc<Program>,
    perf_logger: Arc<impl PerfLogger>,
) -> ValidationResult<Arc<Program>> {
    // JS compiler
    // + SkipUnreachableNodeTransform
    // + InlineFragmentsTransform
    // + ClientExtensionsTransform
    // + GenerateTypeNameTransform
    // + FlattenTransform, flattenAbstractTypes: true
    // + SkipRedundantNodesTransform
    let log_event = perf_logger.create_event("apply_normalization_transforms");
    log_event.string("project", project_name.to_string());

    let program = log_event.time("relay_early_flush", || relay_early_flush(&program))?;
    let program = log_event.time("skip_unreachable_node", || skip_unreachable_node(&program));
    let program = log_event.time("inline_fragments", || inline_fragments(&program));
    let program = log_event.time("client_extensions", || client_extensions(&program));
    let program = log_event.time("generate_typename", || generate_typename(&program, true));
    let program = log_event.time("flatten", || flatten(&program, true));
    log_event.time("validate_module_conflicts", || {
        validate_module_conflicts(&program)
    })?;
    let program = log_event.time("skip_redundant_nodes", || skip_redundant_nodes(&program));
    let program = log_event.time("dedupe_type_discriminator", || {
        dedupe_type_discriminator(&program)
    });

    perf_logger.complete_event(log_event);

    Ok(Arc::new(program))
}

/// After the operation transforms, this applies further transforms that only
/// apply to the printed operation text.
///
/// Corresponds to the "print transforms" in the JS compiler
fn apply_operation_text_transforms(
    project_name: &str,
    program: Arc<Program>,
    perf_logger: Arc<impl PerfLogger>,
) -> ValidationResult<Arc<Program>> {
    // JS compiler
    // + SkipSplitOperationTransform
    // - ClientExtensionsTransform
    // + SkipClientExtensionsTransform
    // + SkipUnreachableNodeTransform
    // + GenerateTypeNameTransform
    // + FlattenTransform, flattenAbstractTypes: false
    // - SkipHandleFieldTransform
    // - FilterDirectivesTransform
    // + SkipUnusedVariablesTransform
    // - ValidateRequiredArgumentsTransform
    let log_event = perf_logger.create_event("apply_operation_text_transforms");
    log_event.string("project", project_name.to_string());

    let program = log_event.time("relay_early_flush", || relay_early_flush(&program))?;
    let program = log_event.time("skip_split_operation", || skip_split_operation(&program));
    let program = log_event.time("skip_client_extensions", || {
        skip_client_extensions(&program)
    });
    let program = log_event.time("skip_unreachable_node", || skip_unreachable_node(&program));
    let program = log_event.time("generate_typename", || generate_typename(&program, false));
    let program = log_event.time("flatten", || flatten(&program, false));
    let program = log_event.time("skip_unused_variables", || skip_unused_variables(&program));
    let program = log_event.time("unwrap_custom_directive_selection", || {
        unwrap_custom_directive_selection(&program)
    });
    perf_logger.complete_event(log_event);

    Ok(Arc::new(program))
}

fn apply_typegen_transforms(
    project_name: &str,
    program: Arc<Program>,
    base_fragment_names: Arc<FnvHashSet<StringKey>>,
    perf_logger: Arc<impl PerfLogger>,
) -> ValidationResult<Arc<Program>> {
    // JS compiler
    // * RelayDirectiveTransform
    // + MaskTransform
    // + MatchTransform
    // + FlattenTransform, flattenAbstractTypes: false
    // + RefetchableFragmentTransform,
    let log_event = perf_logger.create_event("apply_typegen_transforms");
    log_event.string("project", project_name.to_string());

    let program = log_event.time("mask", || mask(&program));
    let program = log_event.time("transform_match", || transform_match(&program))?;
    let program = log_event.time("flatten", || flatten(&program, false));
    let program = log_event.time("transform_refetchable_fragment", || {
        transform_refetchable_fragment(&program, &base_fragment_names, true)
            .expect("Expected errors to be validated in common transforms.")
    });
    let program = log_event.time("remove_base_fragments", || {
        remove_base_fragments(&program, base_fragment_names)
    });
    perf_logger.complete_event(log_event);

    Ok(Arc::new(program))
}
