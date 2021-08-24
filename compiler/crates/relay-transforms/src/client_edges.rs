/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use std::sync::Arc;

use crate::relay_resolvers::RELAY_RESOLVER_DIRECTIVE_NAME;
use common::{Diagnostic, DiagnosticsResult, NamedItem, WithLocation};
use graphql_ir::{Directive, LinkedField, Program, Selection, Transformed, Transformer};
use schema::Schema;

lazy_static! {
    pub static ref CLIENT_EDGE_METADATA_KEY: StringKey = "__clientEdge".intern();
}

pub fn client_edges(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = ClientEdgesTransform::new(program);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct ClientEdgesTransform<'program> {
    program: &'program Program,
    errors: Vec<Diagnostic>,
}

impl<'program> ClientEdgesTransform<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            errors: Default::default(),
        }
    }
}

impl Transformer for ClientEdgesTransform<'_> {
    const NAME: &'static str = "RelayEdgesTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let field_type = self.program.schema.field(field.definition.item);
        if !field_type.is_extension {
            return self.default_transform_linked_field(field);
        };

        // Eventually we will want to enable client edges on non-resolver client
        // schema extensions, but we'll start with limiting them to resolvers.
        if field_type
            .directives
            .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
            .is_none()
        {
            return self.default_transform_linked_field(field);
        }

        let mut new_directives = field.directives.clone();

        new_directives.push(Directive {
            name: WithLocation::generated(*CLIENT_EDGE_METADATA_KEY),
            arguments: vec![],
        });

        let new_selections = self
            .transform_selections(&field.selections)
            .replace_or_else(|| field.selections.clone());

        let new_field = LinkedField {
            directives: new_directives,
            selections: new_selections,
            ..field.clone()
        };

        return Transformed::Replace(Selection::LinkedField(Arc::new(new_field)));
    }
}
