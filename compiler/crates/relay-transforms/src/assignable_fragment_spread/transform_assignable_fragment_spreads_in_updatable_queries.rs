/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{NamedItem, WithLocation};
use graphql_ir::{
    associated_data_impl, Directive, FragmentDefinition, FragmentSpread, OperationDefinition,
    Program, Selection, Transformed, Transformer,
};
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::{SDLSchema, Schema, Type};
use std::sync::Arc;

lazy_static! {
    static ref UPDATABLE_DIRECTIVE: StringKey = "updatable".intern();
    pub static ref ASSIGNABLE_DIRECTIVE_FOR_TYPEGEN: StringKey = "__assignable".intern();
}

#[derive(Clone, Debug, PartialEq, Eq, Hash, Copy)]
pub enum TypeConditionInfo {
    Abstract,
    Concrete { concrete_type: StringKey },
}

associated_data_impl!(TypeConditionInfo);

/// Transform all of the updatable queries and fragments in a program by adding
/// an internal-only directive on every fragment spread containing
/// TypeConditionInfo in the associated data.
///
/// This directive is then consumed by the typegen step (which does not have
/// access to the schema) to determine how to create the setter for a given linked
/// field.
///
/// The value that is passed to the setter of a singular linked field is the union of:
/// - null
/// - { __typename: 'ConcreteTypeName', __id: string, $fragmentRefs: spreadRef }
///   for each spread of a concrete type
/// - { __isFragmentName: string, __id: string, $fragmentRefs: spreadRef }
///   for each spread of an abstract type
///
/// For a plural linked field, replace null with [] and the unions with an array of
/// the union of those objects.
pub fn transform_assignable_fragment_spreads_in_updatable_queries(program: &Program) -> Program {
    let mut transform = AssignableFragmentSpreadForUpdatable { program };

    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct AssignableFragmentSpreadForUpdatable<'s> {
    program: &'s Program,
}

impl<'s> Transformer for AssignableFragmentSpreadForUpdatable<'s> {
    const NAME: &'static str = "AssignableFragmentTransformForUpdatable";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        if operation.directives.named(*UPDATABLE_DIRECTIVE).is_some() {
            self.default_transform_operation(operation)
        } else {
            Transformed::Keep
        }
    }

    fn transform_fragment(
        &mut self,
        operation: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        if operation.directives.named(*UPDATABLE_DIRECTIVE).is_some() {
            self.default_transform_fragment(operation)
        } else {
            Transformed::Keep
        }
    }

    fn transform_fragment_spread(
        &mut self,
        fragment_spread: &FragmentSpread,
    ) -> Transformed<Selection> {
        let fragment_definition = self
            .program
            .fragment(fragment_spread.fragment.item)
            .expect("Expected fragment to exist.");

        let spread = fragment_spread.clone();
        Transformed::Replace(Selection::FragmentSpread(Arc::new(FragmentSpread {
            directives: vec![get_directive(
                fragment_definition.type_condition,
                &self.program.schema,
            )],
            ..spread
        })))
    }
}

fn get_directive(type_condition: Type, schema: &SDLSchema) -> Directive {
    Directive {
        name: WithLocation::generated(*ASSIGNABLE_DIRECTIVE_FOR_TYPEGEN),
        arguments: vec![],
        data: Some(Box::new(get_associated_data(type_condition, schema))),
    }
}

fn get_associated_data(type_condition: Type, schema: &SDLSchema) -> TypeConditionInfo {
    if type_condition.is_abstract_type() {
        TypeConditionInfo::Abstract
    } else {
        TypeConditionInfo::Concrete {
            concrete_type: schema.get_type_name(type_condition),
        }
    }
}
