/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use common::FeatureFlags;
use graphql_ir::Program;
use graphql_ir::Transformer;

/// Transform selections on abstract types.
///
/// First we locate fields which are abstract types. Then we convert all of its
/// selections into inline fragments per concrete type with the same
/// selections.
pub fn relay_resolvers_abstract_types(
    program: &Program,
    feature_flags: &FeatureFlags,
) -> DiagnosticsResult<Program> {
    if !feature_flags
        .relay_resolver_enable_interface_output_type
        .is_fully_enabled()
    {
        return Ok(program.clone());
    }
    let mut transform = RelayResolverAbstractTypesTransform::new(program);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct RelayResolverAbstractTypesTransform<'program> {
    _program: &'program Program,
    errors: Vec<Diagnostic>,
}

impl<'program> RelayResolverAbstractTypesTransform<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            _program: program,
            errors: Default::default(),
        }
    }

    // TODO T174693027 Implement transform
}

impl Transformer for RelayResolverAbstractTypesTransform<'_> {
    const NAME: &'static str = "RelayResolverAbstractTypesTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;
}
