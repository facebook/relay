/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult, NamedItem};
use graphql_ir::{ConstantValue, Directive, OperationDefinition, Value};
use intern::intern;

/// Check, if the operation is @preloadable.
pub fn is_operation_preloadable(operation: &OperationDefinition) -> bool {
    find_preloadable_directive(operation).is_some()
}

/// Check if th the operation has a `@preloadable(hackPreloader: true)` directive
pub fn should_generate_hack_preloader(operation: &OperationDefinition) -> DiagnosticsResult<bool> {
    if let Some(directive) = find_preloadable_directive(operation) {
        if let Some(arg) = directive.arguments.named(intern!("hackPreloader")) {
            return if let Value::Constant(ConstantValue::Boolean(value)) = arg.value.item {
                Ok(value)
            } else {
                Err(vec![Diagnostic::error(
                    "`hackPreloader` argument to @preloadable needs to be a constant boolean value",
                    arg.value.location,
                )])
            };
        }
    }
    Ok(false)
}

fn find_preloadable_directive(operation: &OperationDefinition) -> Option<&Directive> {
    operation.directives.named(intern!("preloadable"))
}
