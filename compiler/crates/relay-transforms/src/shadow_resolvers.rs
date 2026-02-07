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
use graphql_ir::FragmentDefinitionName;
use graphql_ir::Program;
use graphql_syntax::ConstantValue;
use graphql_syntax::is_valid_identifier;
use intern::Lookup;
use schema::Schema;

use super::ValidationMessage;
use crate::extract_module_name;

/// Shadow resolvers transform.
///
/// This transform handles shadow resolver-related processing and validation.
pub fn shadow_resolvers_transform(
    program: &Program,
    feature_flags: &FeatureFlags,
) -> DiagnosticsResult<Program> {
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

            // If the feature flag is not enabled, report error and skip other validations
            if !feature_flags.enable_shadow_resolvers.is_fully_enabled() {
                errors.push(Diagnostic::error(
                    ValidationMessage::ReturnFragmentRequiresFeatureFlag,
                    location,
                ));
                continue;
            }

            // Extract the fragment name string from the argument value
            let fragment_name_str = match &return_fragment_arg.value {
                ConstantValue::String(s) => s.value,
                _ => continue, // Non-string values are handled elsewhere
            };

            // Validate: fragment name must be a valid GraphQL identifier
            if !is_valid_identifier(fragment_name_str.lookup()) {
                errors.push(Diagnostic::error(
                    ValidationMessage::ReturnFragmentInvalidName {
                        name: fragment_name_str,
                    },
                    location,
                ));
                continue;
            }

            // Validate: no fragment with this name should exist in the project
            let fragment_def_name = FragmentDefinitionName(fragment_name_str);
            if let Some(existing_fragment) = program.fragment(fragment_def_name) {
                errors.push(
                    Diagnostic::error(
                        ValidationMessage::ReturnFragmentConflictsWithExistingFragment {
                            name: fragment_name_str,
                        },
                        location,
                    )
                    .annotate(
                        "existing fragment defined here",
                        existing_fragment.name.location,
                    ),
                );
            }

            // Validate: fragment name must start with the module name (namespace rule)
            let source_location = field.name.location.source_location();
            if !source_location.is_generated()
                && let Some(module_name) = extract_module_name(source_location.path())
                && !fragment_name_str.lookup().starts_with(&module_name)
            {
                errors.push(Diagnostic::error(
                    ValidationMessage::ReturnFragmentInvalidModuleName {
                        module_name,
                        fragment_name: fragment_name_str,
                    },
                    location,
                ));
            }
        }
    }

    if errors.is_empty() {
        Ok(program.clone())
    } else {
        Err(errors)
    }
}
