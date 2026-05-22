/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::DirectiveName;
use common::Location;
use common::WithLocation;
use graphql_ir::Directive;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use intern::string_key::Intern;
use lazy_static::lazy_static;
use schema::FieldID;
use schema::Schema;

lazy_static! {
    pub static ref QUERY_ROOT_SELECTION_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("__queryRootSelection".intern());
}

/// Reader transform: converts `__query { ... }` LinkedFields into
/// InlineFragments with `@__queryRootSelection` directive. The codegen
/// recognizes this and emits a `QueryRootSelection` reader node, which
/// the runtime handles by reading selections from the root record.
pub fn query_root_selection_reader_transform(program: &Program) -> Program {
    let query_field_id = program.schema.query_selection_field();
    let mut transform = QueryRootSelectionTransform { query_field_id };
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct QueryRootSelectionTransform {
    query_field_id: FieldID,
}

impl<'s> Transformer<'s> for QueryRootSelectionTransform {
    const NAME: &'static str = "QueryRootSelectionReaderTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_linked_field(&mut self, field: &'s LinkedField) -> Transformed<Selection> {
        if field.definition.item == self.query_field_id {
            Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                type_condition: None,
                directives: vec![Directive {
                    name: WithLocation::generated(*QUERY_ROOT_SELECTION_DIRECTIVE_NAME),
                    arguments: vec![],
                    data: None,
                    location: Location::generated(),
                }],
                selections: field.selections.clone(),
                spread_location: Location::generated(),
            })))
        } else {
            self.default_transform_linked_field(field)
        }
    }
}
