/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use common::FeatureFlags;
use common::NamedItem;
use docblock_shared::RELAY_RESOLVER_DIRECTIVE_NAME;
use docblock_shared::RETURN_FRAGMENT_ARGUMENT_NAME;
use graphql_ir::Program;
use schema::Schema;

use super::ValidationMessage;

/// Shadow resolvers transform.
///
/// This transform handles shadow resolver-related processing.
pub fn shadow_resolvers_transform(
    program: &Program,
    feature_flags: &FeatureFlags,
) -> DiagnosticsResult<Program> {
    // If the feature flag is enabled, validation passes
    if feature_flags.enable_shadow_resolvers.is_fully_enabled() {
        return Ok(program.clone());
    }

    let mut errors = Vec::new();

    // Iterate over all fields in the schema to find resolver fields with return_fragment
    for field in program.schema.fields() {
        // Check if this field has a @relay_resolver directive with return_fragment argument
        if let Some(resolver_directive) = field.directives.named(*RELAY_RESOLVER_DIRECTIVE_NAME)
            && let Some(return_fragment_arg) = resolver_directive
                .arguments
                .named(*RETURN_FRAGMENT_ARGUMENT_NAME)
        {
            // Use the location of the return_fragment argument value (the fragment name)
            let location = field
                .name
                .location
                .with_span(return_fragment_arg.value.span());
            errors.push(Diagnostic::error(
                ValidationMessage::ReturnFragmentRequiresFeatureFlag,
                location,
            ));
        }
    }

    if errors.is_empty() {
        Ok(program.clone())
    } else {
        Err(errors)
    }
}
