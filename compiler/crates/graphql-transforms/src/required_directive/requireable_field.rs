/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::{ACTION_ARGUMENT, REQUIRED_DIRECTIVE_NAME};
use common::{Diagnostic, Location, Named, NamedItem, WithLocation};
use graphql_ir::{ConstantValue, Directive, LinkedField, ScalarField, ValidationMessage, Value};
use interner::StringKey;
use schema::Schema;

#[derive(Clone, Copy)]
pub struct RequiredMetadata {
    pub action: StringKey,
    pub directive_location: Location,
    pub action_location: Location,
}

pub trait RequireableField {
    fn directives(&self) -> &Vec<Directive>;
    fn name_with_location(&self, schema: &Schema) -> WithLocation<StringKey>;
    fn required_directive(&self) -> Result<Option<&Directive>, Diagnostic> {
        let mut required_directives = self
            .directives()
            .iter()
            .filter(|directive| directive.name() == *REQUIRED_DIRECTIVE_NAME);
        let maybe_first_directive = required_directives.next();
        let maybe_second_directive = required_directives.next();

        if let Some(first_directive) = maybe_first_directive {
            if let Some(second_directive) = maybe_second_directive {
                return Err(Diagnostic::error(
                    ValidationMessage::RequiredOncePerField,
                    second_directive.name.location,
                )
                .annotate("it also appears here", first_directive.name.location));
            }
        }
        Ok(maybe_first_directive)
    }

    fn required_metadata(&self) -> Result<Option<RequiredMetadata>, Diagnostic> {
        self.required_directive()?
            .map_or(Ok(None), |required_directive| {
                get_action_argument(required_directive).map(|action_arg| {
                    Some(RequiredMetadata {
                        action: action_arg.item,
                        action_location: action_arg.location,
                        directive_location: required_directive.name.location,
                    })
                })
            })
    }
}

impl RequireableField for ScalarField {
    fn directives(&self) -> &Vec<Directive> {
        &self.directives
    }
    fn name_with_location(&self, schema: &Schema) -> WithLocation<StringKey> {
        WithLocation::new(self.alias_or_name_location(), self.alias_or_name(schema))
    }
}

impl RequireableField for LinkedField {
    fn directives(&self) -> &Vec<Directive> {
        &self.directives
    }
    fn name_with_location(&self, schema: &Schema) -> WithLocation<StringKey> {
        WithLocation::new(self.alias_or_name_location(), self.alias_or_name(schema))
    }
}

fn get_action_argument(
    required_directive: &Directive,
) -> Result<WithLocation<StringKey>, Diagnostic> {
    let maybe_action_arg = required_directive.arguments.named(*ACTION_ARGUMENT);
    let action_arg = maybe_action_arg.ok_or_else(|| {
        Diagnostic::error(
            ValidationMessage::RequiredActionArgumentRequired,
            required_directive.name.location,
        )
    })?;

    match &action_arg.value.item {
        Value::Constant(value) => match value {
            ConstantValue::Enum(action) => {
                Ok(WithLocation::new(action_arg.value.location, *action))
            }
            _ => Err(Diagnostic::error(
                ValidationMessage::RequiredActionArgumentEnum,
                action_arg.value.location,
            )),
        },
        _ => Err(Diagnostic::error(
            ValidationMessage::RequiredActionArgumentConstant,
            action_arg.value.location,
        )),
    }
}
