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
    apply_fragment_arguments, client_extensions, disallow_id_as_alias, flatten, generate_id_field,
    generate_live_query_metadata, generate_preloadable_metadata,
    generate_subscription_name_metadata, generate_typename, handle_field_transform,
    inline_data_fragment, inline_fragments, mask, relay_early_flush, remove_base_fragments,
    skip_client_extensions, skip_redundant_nodes, skip_split_operation, skip_unreachable_node,
    skip_unused_variables, split_module_import, transform_connections, transform_defer_stream,
    transform_match, transform_refetchable_fragment, unwrap_custom_directive_selection,
    validate_module_conflicts, validate_relay_directives, validate_server_only_directives,
    validate_unused_variables, ConnectionInterface,
};
use interner::StringKey;

pub struct Programs<'schema> {
    pub source: Program<'schema>,
    pub reader: Program<'schema>,
    pub normalization: Program<'schema>,
    pub operation_text: Program<'schema>,
    pub typegen: Program<'schema>,
}

pub fn apply_transforms<'schema>(
    project_name: &str,
    program: Program<'schema>,
    base_fragment_names: &FnvHashSet<StringKey>,
    connection_interface: &ConnectionInterface,
    perf_logger: &impl PerfLogger,
) -> ValidationResult<Programs<'schema>> {
    // common
    //  |- reader
    //  |- operation
    //     |- normalization
    //     |- operation_text
    let common_program = apply_common_transforms(
        project_name,
        &program,
        connection_interface,
        base_fragment_names,
        perf_logger,
    )?;
    let reader_program = apply_reader_transforms(
        project_name,
        &common_program,
        base_fragment_names,
        perf_logger,
    )?;
    let operation_program = apply_operation_transforms(
        project_name,
        &common_program,
        base_fragment_names,
        perf_logger,
    )?;
    let normalization_program =
        apply_normalization_transforms(project_name, &operation_program, perf_logger)?;
    let operation_text_program =
        apply_operation_text_transforms(project_name, &operation_program, perf_logger)?;
    let typegen_program =
        apply_typegen_transforms(project_name, &program, base_fragment_names, perf_logger)?;

    Ok(Programs {
        source: program,
        reader: reader_program,
        normalization: normalization_program,
        operation_text: operation_text_program,
        typegen: typegen_program,
    })
}

/// Applies transforms that apply to every output.
fn apply_common_transforms<'schema>(
    project_name: &str,
    program: &Program<'schema>,
    connection_interface: &ConnectionInterface,
    base_fragment_names: &FnvHashSet<StringKey>,
    perf_logger: &impl PerfLogger,
) -> ValidationResult<Program<'schema>> {
    // JS compiler
    // + DisallowIdAsAlias
    // + ConnectionTransform
    // + RelayDirectiveTransform
    // + MaskTransform
    // + MatchTransform
    // + RefetchableFragmentTransform
    // + DeferStreamTransform
    let log_event = perf_logger.create_event("apply_common_transforms");
    log_event.string("project", project_name.to_string());

    log_event.time("disallow_id_as_alias", || disallow_id_as_alias(program))?;
    log_event.time("validate_unused_variables", || {
        validate_unused_variables(&program)
    })?;
    log_event.time("validate_relay_directives", || {
        validate_relay_directives(&program)
    })?;
    let program = log_event.time("transform_connections", || {
        transform_connections(program, connection_interface)
    });
    let program = log_event.time("mask", || mask(&program));
    let program = log_event.time("transform_match", || transform_match(&program))?;
    let program = log_event.time("transform_defer_stream", || {
        transform_defer_stream(&program)
    })?;
    let program = log_event.time("transform_refetchable_fragment", || {
        transform_refetchable_fragment(&program, &base_fragment_names, false)
    });
    perf_logger.complete_event(log_event);

    program
}

/// Applies transforms only for generated reader code.
/// Corresponds to the "fragment transforms" in the JS compiler.
fn apply_reader_transforms<'schema>(
    project_name: &str,
    program: &Program<'schema>,
    base_fragment_names: &FnvHashSet<StringKey>,
    perf_logger: &impl PerfLogger,
) -> ValidationResult<Program<'schema>> {
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

    Ok(program)
}

/// Applies transforms that apply to all operation artifacts.
/// Corresponds to the "query transforms" in the JS compiler.
fn apply_operation_transforms<'schema>(
    project_name: &str,
    program: &Program<'schema>,
    base_fragment_names: &FnvHashSet<StringKey>,
    perf_logger: &impl PerfLogger,
) -> ValidationResult<Program<'schema>> {
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
        split_module_import(&program, base_fragment_names)
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

    Ok(program)
}

/// After the operation transforms, this applies further transforms that only
/// apply to the generated normalization code.
///
/// Corresponds to the "codegen transforms" in the JS compiler
fn apply_normalization_transforms<'schema>(
    project_name: &str,
    program: &Program<'schema>,
    perf_logger: &impl PerfLogger,
) -> ValidationResult<Program<'schema>> {
    // JS compiler
    // + SkipUnreachableNodeTransform
    // + InlineFragmentsTransform
    // + ClientExtensionsTransform
    // + GenerateTypeNameTransform
    // + FlattenTransform, flattenAbstractTypes: true
    // + SkipRedundantNodesTransform
    // + ValidateServerOnlyDirectivesTransform
    let log_event = perf_logger.create_event("apply_normalization_transforms");
    log_event.string("project", project_name.to_string());

    let program = log_event.time("relay_early_flush", || relay_early_flush(&program))?;
    let program = log_event.time("skip_unreachable_node", || skip_unreachable_node(&program));
    log_event.time("validate_server_only_directives", || {
        validate_server_only_directives(&program)
    })?;
    let program = log_event.time("inline_fragments", || inline_fragments(&program));
    let program = log_event.time("client_extensions", || client_extensions(&program));
    let program = log_event.time("generate_typename", || generate_typename(&program, true));
    let program = log_event.time("flatten", || flatten(&program, true));
    log_event.time("validate_module_conflicts", || {
        validate_module_conflicts(&program)
    })?;
    let program = log_event.time("skip_redundant_nodes", || skip_redundant_nodes(&program));

    perf_logger.complete_event(log_event);

    Ok(program)
}

/// After the operation transforms, this applies further transforms that only
/// apply to the printed operation text.
///
/// Corresponds to the "print transforms" in the JS compiler
fn apply_operation_text_transforms<'schema>(
    project_name: &str,
    program: &Program<'schema>,
    perf_logger: &impl PerfLogger,
) -> ValidationResult<Program<'schema>> {
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

    Ok(program)
}

fn apply_typegen_transforms<'schema>(
    project_name: &str,
    program: &Program<'schema>,
    base_fragment_names: &FnvHashSet<StringKey>,
    perf_logger: &impl PerfLogger,
) -> ValidationResult<Program<'schema>> {
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

    Ok(program)
}
