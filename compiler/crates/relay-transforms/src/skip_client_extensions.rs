/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DirectiveName;
use graphql_ir::Directive;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use schema::Schema;

use crate::util::CustomMetadataDirectives;

/// Transform to skip IR nodes if they are client-defined extensions
/// to the schema
pub fn skip_client_extensions(program: &Program) -> Program {
    let mut transform = SkipClientExtensionsTransform::new(program);
    let transformed = transform.transform_program(program);

    transformed.replace_or_else(|| program.clone())
}

struct SkipClientExtensionsTransform<'s> {
    program: &'s Program,
}

impl<'s> SkipClientExtensionsTransform<'s> {
    fn new(program: &'s Program) -> Self {
        Self { program }
    }
}

impl SkipClientExtensionsTransform<'_> {
    fn is_client_directive(&self, name: DirectiveName) -> bool {
        // Return true if:
        // - directive is a custom internal directive used to hold
        //   metadata in the IR
        // - or, directive is a client-defined directive, not present
        //   in the server schema
        CustomMetadataDirectives::is_custom_metadata_directive(name)
            || self.program.schema.is_extension_directive(name)
    }
}

impl Transformer<'_> for SkipClientExtensionsTransform<'_> {
    const NAME: &'static str = "SkipClientExtensionsTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = true;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.default_transform_operation(operation)
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        if self
            .program
            .schema
            .is_extension_type(fragment.type_condition)
        {
            Transformed::Delete
        } else {
            self.default_transform_fragment(fragment)
        }
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        let fragment = self.program.fragment(spread.fragment.item).unwrap();
        if self
            .program
            .schema
            .is_extension_type(fragment.type_condition)
        {
            Transformed::Delete
        } else {
            self.default_transform_fragment_spread(spread)
        }
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        if let Some(type_condition) = fragment.type_condition
            && self.program.schema.is_extension_type(type_condition)
        {
            return Transformed::Delete;
        }
        self.default_transform_inline_fragment(fragment)
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        if self
            .program
            .schema
            .field(field.definition.item)
            .is_extension
        {
            Transformed::Delete
        } else {
            self.default_transform_linked_field(field)
        }
    }

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        if self
            .program
            .schema
            .field(field.definition.item)
            .is_extension
        {
            Transformed::Delete
        } else {
            self.default_transform_scalar_field(field)
        }
    }

    fn transform_directive(&mut self, directive: &Directive) -> Transformed<Directive> {
        if self.is_client_directive(directive.name.item) {
            Transformed::Delete
        } else {
            self.default_transform_directive(directive)
        }
    }
}
