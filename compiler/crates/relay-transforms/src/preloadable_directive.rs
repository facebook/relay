/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::ArgumentName;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::NamedItem;
use graphql_ir::Directive;
use graphql_ir::OperationDefinition;
use intern::intern;

/// Check, if the operation is @preloadable.
pub fn is_operation_preloadable(operation: &OperationDefinition) -> bool {
    find_preloadable_directive(operation).is_some()
}

/// Check if th the operation has a `@preloadable(hackPreloader: true)` directive
pub fn should_generate_hack_preloader(operation: &OperationDefinition) -> DiagnosticsResult<bool> {
    if let Some(directive) = find_preloadable_directive(operation)
        && let Some(arg) = directive
            .arguments
            .named(ArgumentName(intern!("hackPreloader")))
    {
        return Ok(arg.value.item.expect_constant().unwrap_boolean());
    }
    Ok(false)
}

fn find_preloadable_directive(operation: &OperationDefinition) -> Option<&Directive> {
    operation
        .directives
        .named(DirectiveName(intern!("preloadable")))
}
