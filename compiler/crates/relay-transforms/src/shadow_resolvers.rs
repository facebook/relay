/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::FeatureFlags;
use graphql_ir::Field;
use graphql_ir::Program;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_syntax::is_valid_identifier;
use intern::Lookup;
use schema::FieldID;
use schema::Schema;

use super::ValidationMessage;
use crate::extract_module_name;
use crate::relay_resolvers::RelayResolverMetadata;
use crate::relay_resolvers::get_resolver_fragment_dependency_name;

/// Shadow resolvers transform.
///
/// This transform validates return_fragment on resolver fields that are actually
/// used in operations/fragments. It uses the Transformer trait to visit fields
/// and tracks which schema fields have been validated to avoid duplicate validation.
pub fn shadow_resolvers_transform(
    program: &Program,
    feature_flags: &FeatureFlags,
) -> DiagnosticsResult<Program> {
    let mut transform = ShadowResolversTransform::new(program, feature_flags);
    transform.transform_program(program);

    if transform.errors.is_empty() {
        Ok(program.clone())
    } else {
        Err(transform.errors)
    }
}

struct ShadowResolversTransform<'program> {
    program: &'program Program,
    feature_flags: &'program FeatureFlags,
    errors: Vec<Diagnostic>,
    /// Track which resolver fields have been validated to avoid duplicate validation
    validated_fields: HashSet<FieldID>,
}

impl<'program> ShadowResolversTransform<'program> {
    fn new(program: &'program Program, feature_flags: &'program FeatureFlags) -> Self {
        Self {
            program,
            feature_flags,
            errors: Vec::new(),
            validated_fields: HashSet::new(),
        }
    }

    fn validate_resolver_directives(&mut self, directives: &[graphql_ir::Directive]) {
        // Use RelayResolverMetadata::find to get metadata from IR directives
        // Note: After relay_resolvers_spread_transform, resolver fields become either:
        // - ScalarField for __id (for resolvers without root fragments)
        // - FragmentSpread (for resolvers with root fragments)
        // Both have RelayResolverMetadata attached to their directives.
        let resolver_metadata = match RelayResolverMetadata::find(directives) {
            Some(metadata) => metadata,
            None => return,
        };

        // Use the field_id from the metadata (the original resolver field)
        let field_id = resolver_metadata.field_id;

        // Skip if already validated
        if self.validated_fields.contains(&field_id) {
            return;
        }
        self.validated_fields.insert(field_id);

        // Check if this resolver has a return_fragment
        let return_fragment = match &resolver_metadata.return_fragment {
            Some(rf) => rf,
            None => return,
        };

        // Location is available directly from return_fragment
        let location = return_fragment.location;

        // If the feature flag is not enabled, report error and skip other validations
        if !self
            .feature_flags
            .enable_shadow_resolvers
            .is_fully_enabled()
        {
            self.errors.push(Diagnostic::error(
                ValidationMessage::ReturnFragmentRequiresFeatureFlag,
                location,
            ));
            return;
        }

        // Validate: resolver must define a root fragment when using @returnFragment.
        // Detect the root fragment from the schema (the resolver's @rootFragment),
        // not from `fragment_data_injection_mode` — that field is only populated for
        // `@injectFragmentData` and is None for a key-only root fragment.
        if get_resolver_fragment_dependency_name(self.program.schema.field(field_id)).is_none() {
            self.errors.push(Diagnostic::error(
                ValidationMessage::ReturnFragmentRequiresRootFragment,
                location,
            ));
            return;
        }

        // Validate: fragment name must be a valid GraphQL identifier
        if !is_valid_identifier(return_fragment.item.lookup()) {
            self.errors.push(Diagnostic::error(
                ValidationMessage::ReturnFragmentInvalidName {
                    name: return_fragment.item.0,
                },
                location,
            ));
            return;
        }

        // Validate: no fragment with this name should exist in the project
        if let Some(existing_fragment) = self.program.fragment(return_fragment.item) {
            self.errors.push(
                Diagnostic::error(
                    ValidationMessage::ReturnFragmentConflictsWithExistingFragment {
                        name: return_fragment.item.0,
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
        let schema_field = self.program.schema.field(field_id);
        let source_location = schema_field.name.location.source_location();
        if let Some(module_name) = extract_module_name(source_location.path())
            && !return_fragment.item.lookup().starts_with(&module_name)
        {
            self.errors.push(Diagnostic::error(
                ValidationMessage::ReturnFragmentInvalidModuleName {
                    module_name,
                    fragment_name: return_fragment.item.0,
                },
                location,
            ));
        }
    }
}

impl Transformer<'_> for ShadowResolversTransform<'_> {
    const NAME: &'static str = "ShadowResolversTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(
        &mut self,
        field: &graphql_ir::ScalarField,
    ) -> Transformed<graphql_ir::Selection> {
        self.validate_resolver_directives(field.directives());
        Transformed::Keep
    }

    fn transform_linked_field(
        &mut self,
        field: &graphql_ir::LinkedField,
    ) -> Transformed<graphql_ir::Selection> {
        self.validate_resolver_directives(field.directives());
        self.default_transform_linked_field(field)
    }

    fn transform_fragment_spread(
        &mut self,
        spread: &graphql_ir::FragmentSpread,
    ) -> Transformed<graphql_ir::Selection> {
        self.validate_resolver_directives(&spread.directives);
        Transformed::Keep
    }
}
