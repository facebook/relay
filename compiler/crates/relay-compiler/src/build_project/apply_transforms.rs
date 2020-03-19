/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::FnvHashSet;
use graphql_ir::{Program, ValidationResult};
use graphql_transforms::{
    apply_fragment_arguments, flatten, generate_id_field, generate_typename, inline_fragments,
    mask, remove_base_fragments, skip_client_extensions, skip_unreachable_node, sort_selections,
    transform_connections, ConnectionInterface,
};
use interner::StringKey;

pub struct Programs<'schema> {
    pub reader: Program<'schema>,
    pub normalization: Program<'schema>,
    pub operation_text: Program<'schema>,
}

pub fn apply_transforms<'schema, TConnectionInterface: ConnectionInterface>(
    program: &Program<'schema>,
    base_fragment_names: &FnvHashSet<StringKey>,
    connection_interface: &TConnectionInterface,
) -> ValidationResult<Programs<'schema>> {
    // common
    //  |- reader
    //  |- operation
    //     |- normalization
    //     |- operation_text
    let common_program = apply_common_transforms(&program, connection_interface);
    let reader_program = apply_reader_transforms(&common_program, base_fragment_names);
    let operation_program = apply_operation_transforms(&common_program)?;
    let normalization_program = apply_normalization_transforms(&operation_program);
    let operation_text_program = apply_operation_text_transforms(&operation_program);

    Ok(Programs {
        reader: reader_program,
        normalization: normalization_program,
        operation_text: operation_text_program,
    })
}

/// Applies transforms that apply to every output.
fn apply_common_transforms<'schema, TConnectionInterface: ConnectionInterface>(
    program: &Program<'schema>,
    connection_interface: &TConnectionInterface,
) -> Program<'schema> {
    // JS compiler
    // - DisallowIdAsAlias
    // - ConnectionTransform
    // - RelayDirectiveTransform
    // - MaskTransform
    // - MatchTransform
    // - RefetchableFragmentTransform
    // - DeferStreamTransform

    let program = transform_connections(program, connection_interface);
    mask(&program)
}

/// Applies transforms only for generated reader code.
/// Corresponds to the "fragment transforms" in the JS compiler.
fn apply_reader_transforms<'schema>(
    program: &Program<'schema>,
    base_fragment_names: &FnvHashSet<StringKey>,
) -> Program<'schema> {
    // JS compiler
    // - ClientExtensionsTransform
    // - FieldHandleTransform
    // - InlineDataFragmentTransform
    // - FlattenTransform, flattenAbstractTypes: true
    // - SkipRedundantNodesTransform

    let program = remove_base_fragments(&program, base_fragment_names);
    let program = flatten(&program, true);
    sort_selections(&program)
}

/// Applies transforms that apply to all operation artifacts.
/// Corresponds to the "query transforms" in the JS compiler.
fn apply_operation_transforms<'schema>(
    program: &Program<'schema>,
) -> ValidationResult<Program<'schema>> {
    // JS compiler
    // - ValidateUnusedVariablesTransform
    // - ApplyFragmentArgumentTransform
    // - ValidateGlobalVariablesTransform
    // - GenerateIDFieldTransform
    // - TestOperationTransform
    let program = apply_fragment_arguments(&program)?;
    let program = generate_id_field(&program);

    Ok(program)
}

/// After the operation transforms, this applies further transforms that only
/// apply to the generated normalization code.
///
/// Corresponds to the "codegen transforms" in the JS compiler
fn apply_normalization_transforms<'schema>(program: &Program<'schema>) -> Program<'schema> {
    // JS compiler
    // - SkipUnreachableNodeTransform
    // - SplitModuleImportTransform
    // - InlineFragmentsTransform
    // - ClientExtensionsTransform
    // - FlattenTransform, flattenAbstractTypes: true
    // - SkipRedundantNodesTransform
    // - GenerateTypeNameTransform
    // - ValidateServerOnlyDirectivesTransform

    let program = skip_unreachable_node(&program);
    let program = inline_fragments(&program);
    let program = flatten(&program, true);
    let program = generate_typename(&program);
    sort_selections(&program)
}

/// After the operation transforms, this applies further transforms that only
/// apply to the printed operation text.
///
/// Corresponds to the "print transforms" in the JS compiler
fn apply_operation_text_transforms<'schema>(program: &Program<'schema>) -> Program<'schema> {
    // JS compiler
    // - ClientExtensionsTransform
    // - SkipClientExtensionsTransform
    // - SkipUnreachableNodeTransform
    // - FlattenTransform, flattenAbstractTypes: false
    // - GenerateTypeNameTransform
    // - SkipHandleFieldTransform
    // - FilterDirectivesTransform
    // - SkipUnusedVariablesTransform
    // - ValidateRequiredArgumentsTransform

    let program = skip_client_extensions(&program);
    let program = skip_unreachable_node(&program);
    let program = flatten(&program, false);
    let program = generate_typename(&program);
    sort_selections(&program)
}
