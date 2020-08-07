/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, NamedItem, WithLocation};
use graphql_ir::{
    Argument, ConstantValue, Directive, LinkedField, Program, ScalarField, Selection, Transformed,
    Transformer, ValidationResult, Value,
};
use interner::Intern;
use interner::StringKey;
use lazy_static::lazy_static;
use std::sync::Arc;

lazy_static! {
    static ref REQURIED_DRECTIVE_NAME: StringKey = "required".intern();
    // static ref QUERY_NAME_ARG: StringKey = "action".intern();
    pub static ref REQUIRED_METADATA_KEY: StringKey = "__required".intern();
    pub static ref PATH_METADATA_ARGUMENT: StringKey = "path".intern();
}

pub fn required_directive(program: &Program) -> ValidationResult<Program> {
    let mut transform = RequiredDirective {
        program,
        errors: Default::default(),
        path: vec![],
    };

    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct RequiredDirective<'s> {
    program: &'s Program,
    errors: Vec<Diagnostic>,
    path: Vec<&'s str>,
}

impl<'s> Transformer for RequiredDirective<'s> {
    const NAME: &'static str = "RequiredDirectiveTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        let required_directive = field.directives.named(*REQURIED_DRECTIVE_NAME);
        if required_directive.is_none() {
            return Transformed::Keep;
        }
        let name = field.alias_or_name(&self.program.schema).lookup();
        self.path.push(name);

        let path_name = self.path.join(".").intern();

        self.path.pop();
        Transformed::Replace(Selection::ScalarField(Arc::new(ScalarField {
            directives: add_path_metadata_directives(&field.directives, path_name),
            ..field.clone()
        })))
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let name = field.alias_or_name(&self.program.schema).lookup();
        self.path.push(name);

        let requried_directive = field.directives.named(*REQURIED_DRECTIVE_NAME);
        let next_directives = match requried_directive {
            Some(_) => {
                let path_name = self.path.join(".").intern();
                add_path_metadata_directives(&field.directives, path_name)
            }
            None => field.directives.clone(),
        };
        let selections = self.transform_selections(&field.selections);

        self.path.pop();
        Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
            directives: next_directives,
            selections: selections.replace_or_else(|| field.selections.clone()),
            ..field.clone()
        })))
    }
}

fn add_path_metadata_directives(directives: &[Directive], path_name: StringKey) -> Vec<Directive> {
    let new_directive: Directive = build_path_metadata_as_directive(path_name);
    let mut next_directives: Vec<Directive> = Vec::with_capacity(directives.len() + 1);
    for directive in directives.iter() {
        next_directives.push(directive.clone());
    }

    next_directives.push(new_directive);
    next_directives
}

fn build_path_metadata_as_directive(path_name: StringKey) -> Directive {
    Directive {
        name: WithLocation::generated(*REQUIRED_METADATA_KEY),
        arguments: vec![build_directive_argument(*PATH_METADATA_ARGUMENT, path_name)],
    }
}

fn build_directive_argument(name: StringKey, value: StringKey) -> Argument {
    Argument {
        name: WithLocation::generated(name),
        value: WithLocation::generated(Value::Constant(ConstantValue::String(value))),
    }
}
