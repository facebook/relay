/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Directive;
use graphql_ir::Field;
use graphql_ir::LinkedField;
use graphql_ir::ScalarField;
use intern::string_key::StringKey;
use schema::SDLSchema;

use super::CATCH_DIRECTIVE_NAME;
use super::TO_ARGUMENT;
use crate::CatchTo;

#[derive(Clone, Copy)]
pub struct CatchMetadata {
    pub to: Option<CatchTo>,
}

#[allow(dead_code)]
pub trait CatchableField {
    fn directives(&self) -> &Vec<Directive>;
    fn name_with_location(&self, schema: &SDLSchema) -> WithLocation<StringKey>;
    fn catch_metadata(&self) -> Result<Option<CatchMetadata>, Diagnostic> {
        if let Some(catch_directive) = self.directives().named(*CATCH_DIRECTIVE_NAME) {
            let maybe_to_arg = catch_directive.arguments.named(*TO_ARGUMENT);
            let to_arg = maybe_to_arg
                .map(|to_arg| CatchTo::from(to_arg.value.item.expect_constant().unwrap_enum()));

            Ok(Some(CatchMetadata { to: to_arg }))
        } else {
            Ok(None)
        }
    }
}

impl CatchableField for ScalarField {
    fn directives(&self) -> &Vec<Directive> {
        &self.directives
    }
    fn name_with_location(&self, schema: &SDLSchema) -> WithLocation<StringKey> {
        WithLocation::new(self.alias_or_name_location(), self.alias_or_name(schema))
    }
}

impl CatchableField for LinkedField {
    fn directives(&self) -> &Vec<Directive> {
        &self.directives
    }
    fn name_with_location(&self, schema: &SDLSchema) -> WithLocation<StringKey> {
        WithLocation::new(self.alias_or_name_location(), self.alias_or_name(schema))
    }
}
