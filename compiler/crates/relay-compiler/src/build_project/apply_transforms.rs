/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::Program;
use graphql_transforms::{
    flatten, generate_id_field, generate_typename, inline_fragments, skip_client_extensions,
    sort_selections,
};

pub struct Programs<'schema> {
    pub reader: Program<'schema>,
    pub normalization: Program<'schema>,
    pub operation_text: Program<'schema>,
}

pub fn apply_transforms<'schema>(program: &Program<'schema>) -> Programs<'schema> {
    // common
    //  |- reader
    //  |- query
    //     |- normalization
    //     |- operation_text
    let common_program = apply_common_transforms(&program);
    let reader_program = apply_reader_transforms(&common_program);
    let query_program = apply_operation_transforms(&common_program);
    let normalization_program = apply_normalization_transforms(&query_program);
    let operation_text_program = apply_operation_text_transforms(&query_program);

    Programs {
        reader: reader_program,
        normalization: normalization_program,
        operation_text: operation_text_program,
    }
}

/// Applies transforms that apply to every output.
fn apply_common_transforms<'schema>(program: &Program<'schema>) -> Program<'schema> {
    // JS compiler
    // - DisallowIdAsAlias
    // - ConnectionTransform
    // - RelayDirectiveTransform
    // - MaskTransform
    // - MatchTransform
    // - RefetchableFragmentTransform
    // - DeferStreamTransform

    // TODO remove this clone once some transform is applied
    program.clone()
}

/// Applies transforms only for generated reader code.
/// Corresponds to the "fragment transforms" in the JS compiler.
fn apply_reader_transforms<'schema>(program: &Program<'schema>) -> Program<'schema> {
    // JS compiler
    // - ClientExtensionsTransform
    // - FieldHandleTransform
    // - InlineDataFragmentTransform
    // - FlattenTransform, flattenAbstractTypes: true
    // - SkipRedundantNodesTransform

    let program = flatten(&program, true);

    sort_selections(&program)
}

/// Applies transforms that apply to all operation artifacts.
/// Corresponds to the "query transforms" in the JS compiler.
fn apply_operation_transforms<'schema>(program: &Program<'schema>) -> Program<'schema> {
    // JS compiler
    // - ValidateUnusedVariablesTransform
    // - ApplyFragmentArgumentTransform
    // - ValidateGlobalVariablesTransform
    // - GenerateIDFieldTransform
    // - TestOperationTransform

    generate_id_field(&program)
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
    let program = flatten(&program, false);
    let program = generate_typename(&program);
    sort_selections(&program)
}
