/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Directive;
use graphql_ir::Field;
use graphql_ir::LinkedField;
use graphql_ir::ScalarField;
use intern::string_key::StringKey;
use schema::FieldID;
use schema::SDLSchema;

use super::ACTION_ARGUMENT;
use super::REQUIRED_DIRECTIVE_NAME;
use super::validation_message::RequiredDirectiveValidationMessage;
use crate::RequiredAction;

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
    fn field_id(&self) -> FieldID;
}

impl RequireableField for ScalarField {
    fn directives(&self) -> &Vec<Directive> {
        &self.directives
    }
    fn name_with_location(&self, schema: &SDLSchema) -> WithLocation<StringKey> {
        WithLocation::new(self.alias_or_name_location(), self.alias_or_name(schema))
    }
    fn field_id(&self) -> FieldID {
        self.definition.item
    }
}

impl RequireableField for LinkedField {
    fn directives(&self) -> &Vec<Directive> {
        &self.directives
    }
    fn name_with_location(&self, schema: &SDLSchema) -> WithLocation<StringKey> {
        WithLocation::new(self.alias_or_name_location(), self.alias_or_name(schema))
    }

    fn field_id(&self) -> FieldID {
        self.definition.item
    }
}

fn get_action_argument(
    required_directive: &Directive,
) -> Result<WithLocation<RequiredAction>, Diagnostic> {
    let maybe_action_arg = required_directive.arguments.named(*ACTION_ARGUMENT);
    let action_arg = maybe_action_arg.ok_or_else(|| {
        Diagnostic::error(
            RequiredDirectiveValidationMessage::ActionArgumentRequired,
            required_directive.location,
        )
    })?;

    let action = action_arg.value.item.expect_constant().unwrap_enum();
    Ok(WithLocation::new(
        action_arg.value.location,
        RequiredAction::from(action),
    ))
}
