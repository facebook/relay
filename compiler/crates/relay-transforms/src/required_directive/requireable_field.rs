/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::RequiredAction;

use super::{ACTION_ARGUMENT, REQUIRED_DIRECTIVE_NAME};
use common::{Diagnostic, Location, NamedItem, WithLocation};
use graphql_ir::{
    ConstantValue, Directive, Field, LinkedField, ScalarField, ValidationMessage, Value,
};
use intern::string_key::StringKey;
use schema::SDLSchema;

#[derive(Clone, Copy)]
pub struct RequiredMetadata {
    pub action: RequiredAction,
    pub directive_location: Location,
    pub action_location: Location,
}

pub trait RequireableField {
    fn directives(&self) -> &Vec<Directive>;
    fn name_with_location(&self, schema: &SDLSchema) -> WithLocation<StringKey>;
    fn required_metadata(&self) -> Result<Option<RequiredMetadata>, Diagnostic> {
        if let Some(required_directive) = self.directives().named(*REQUIRED_DIRECTIVE_NAME) {
            let action_arg = get_action_argument(required_directive)?;
            Ok(Some(RequiredMetadata {
                action: action_arg.item,
                action_location: action_arg.location,
                directive_location: required_directive.name.location,
            }))
        } else {
            Ok(None)
        }
    }
}

impl RequireableField for ScalarField {
    fn directives(&self) -> &Vec<Directive> {
        &self.directives
    }
    fn name_with_location(&self, schema: &SDLSchema) -> WithLocation<StringKey> {
        WithLocation::new(self.alias_or_name_location(), self.alias_or_name(schema))
    }
}

impl RequireableField for LinkedField {
    fn directives(&self) -> &Vec<Directive> {
        &self.directives
    }
    fn name_with_location(&self, schema: &SDLSchema) -> WithLocation<StringKey> {
        WithLocation::new(self.alias_or_name_location(), self.alias_or_name(schema))
    }
}

fn get_action_argument(
    required_directive: &Directive,
) -> Result<WithLocation<RequiredAction>, Diagnostic> {
    let maybe_action_arg = required_directive.arguments.named(*ACTION_ARGUMENT);
    let action_arg = maybe_action_arg.ok_or_else(|| {
        Diagnostic::error(
            ValidationMessage::RequiredActionArgumentRequired,
            required_directive.name.location,
        )
    })?;

    match &action_arg.value.item {
        Value::Constant(value) => match value {
            ConstantValue::Enum(action) => Ok(WithLocation::new(
                action_arg.value.location,
                RequiredAction::from(*action),
            )),
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
