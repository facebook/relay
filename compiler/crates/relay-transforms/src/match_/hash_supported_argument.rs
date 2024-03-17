/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::NamedItem;
use graphql_ir::ConstantValue;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::Value;
use intern::string_key::Intern;
use intern::Lookup;
use schema::SDLSchema;
use schema::Schema;
use schema::TypeReference;
use thiserror::Error;

use super::MATCH_CONSTANTS;
use crate::murmurhash::murmurhash;

pub fn hash_supported_argument(program: &Program) -> DiagnosticsResult<Program> {
    let mut transformer = HashSupportedArgumentTransform {
        schema: &program.schema,
        errors: Default::default(),
    };
    let next_program = transformer.transform_program(program);
    if transformer.errors.is_empty() {
        Ok(next_program.replace_or_else(|| program.clone()))
    } else {
        Err(transformer.errors)
    }
}

struct HashSupportedArgumentTransform<'a> {
    schema: &'a SDLSchema,
    errors: Vec<Diagnostic>,
}

impl<'a> Transformer for HashSupportedArgumentTransform<'a> {
    const NAME: &'static str = "HashSupportedArgumentTransform";

    const VISIT_ARGUMENTS: bool = false;

    const VISIT_DIRECTIVES: bool = false;

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let transformed_field = self.default_transform_linked_field(field);

        if !self.has_match_supported_arg(field) {
            return transformed_field;
        }

        let mut new_field = match transformed_field {
            Transformed::Keep => Arc::new(field.clone()),
            Transformed::Replace(Selection::LinkedField(linked_field)) => linked_field,
            Transformed::Delete | Transformed::Replace(_) => {
                panic!(
                    "unexpected transformed_field in HashSupportedArgumentTransform: {:?}",
                    transformed_field
                )
            }
        };

        let supported_arg = Arc::make_mut(&mut new_field)
            .arguments
            .iter_mut()
            .find(|arg| arg.name.item == MATCH_CONSTANTS.supported_arg)
            .expect("expected to find a supported argument as checked before");

        let mut input = String::new();
        match &supported_arg.value.item {
            Value::Constant(ConstantValue::List(items)) => {
                for item in items {
                    if let ConstantValue::String(name) = item {
                        input.push('\0');
                        input.push_str(name.lookup());
                    } else {
                        panic!("expected all supported arguments to be strings, as verified above");
                    }
                }
            }
            Value::Constant(ConstantValue::String(name)) => {
                // Single item lists can be written without the list wrapper per GraphQL spec
                input.push('\0');
                input.push_str(name.lookup());
            }
            _ => {
                self.errors.push(Diagnostic::error(
                    HashSupportedArgumentError::NonStaticSupportedArg,
                    supported_arg.value.location,
                ));
                return Transformed::Keep;
            }
        };

        let hash = murmurhash(&input);

        supported_arg.value.item = Value::Constant(ConstantValue::String(hash.intern()));

        Transformed::Replace(Selection::LinkedField(new_field))
    }
}

impl<'a> HashSupportedArgumentTransform<'a> {
    /// Returns true iff the field is supplied with a `supported` arg and that
    /// arg has a type of `[string]` (potentially non-nullable somewhere).
    fn has_match_supported_arg(&self, field: &LinkedField) -> bool {
        if field
            .arguments
            .named(MATCH_CONSTANTS.supported_arg)
            .is_none()
        {
            return false;
        }
        let supported_arg_def = self
            .schema
            .field(field.definition.item)
            .arguments
            .named(MATCH_CONSTANTS.supported_arg)
            .expect("field has supported arg, but missing from the schema");

        if let TypeReference::List(item_type) = supported_arg_def.type_.nullable_type() {
            if let TypeReference::Named(item_type_name) = item_type.nullable_type() {
                return self.schema.is_string(*item_type_name);
            }
        }
        false
    }
}

#[derive(Debug, Error, serde::Serialize)]
#[serde(tag = "type")]
pub enum HashSupportedArgumentError {
    #[error(
        "Variables cannot be passed to the `supported` argument for data driven dependency fields, please use literal values like `\"ExampleValue\"`."
    )]
    NonStaticSupportedArg,
}
