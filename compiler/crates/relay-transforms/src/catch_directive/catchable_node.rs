/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::NamedItem;
use graphql_ir::Directive;
use graphql_ir::FragmentDefinition;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::ScalarField;

use super::CATCH_DIRECTIVE_NAME;
use super::TO_ARGUMENT;
use crate::CatchTo;

#[derive(Clone, Copy)]
pub struct CatchMetadata {
    pub to: Option<CatchTo>,
}

#[allow(dead_code)]
pub trait CatchableNode {
    fn directives(&self) -> &Vec<Directive>;
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

impl CatchableNode for ScalarField {
    fn directives(&self) -> &Vec<Directive> {
        &self.directives
    }
}

impl CatchableNode for LinkedField {
    fn directives(&self) -> &Vec<Directive> {
        &self.directives
    }
}

impl CatchableNode for FragmentDefinition {
    fn directives(&self) -> &Vec<Directive> {
        &self.directives
    }
}

impl CatchableNode for OperationDefinition {
    fn directives(&self) -> &Vec<Directive> {
        &self.directives
    }
}

impl CatchableNode for InlineFragment {
    fn directives(&self) -> &Vec<Directive> {
        &self.directives
    }
}
