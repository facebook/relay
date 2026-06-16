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
use graphql_ir::FragmentDefinitionName;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::Visitor;
use graphql_syntax::is_valid_identifier;
use intern::Lookup;
use schema::FieldID;
use schema::Schema;

use super::RelayResolverFieldMetadata;
use super::ValidationMessage;
use crate::extract_module_name;

/// Shadow resolvers transform.
///
/// This transform validates return_fragment on resolver fields. It runs after
/// the field transform (which attaches RelayResolverFieldMetadata) but before
/// the spread transform (which converts fields to fragment spreads).
pub(super) fn shadow_resolvers_transform(
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

    /// Validates resolver metadata attached by the field transform.
    fn validate_resolver_metadata(
        &mut self,
        field_metadata: &RelayResolverFieldMetadata,
        field_id: FieldID,
    ) {
        // Skip if already validated
        if self.validated_fields.contains(&field_id) {
            return;
        }
        self.validated_fields.insert(field_id);

        // Check if this resolver has a return_fragment
        let return_fragment = match &field_metadata.return_fragment {
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

        // Validate: resolver must define a root fragment when using @returnFragment
        if !field_metadata.has_root_fragment() {
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

        // Validate: return fragment must be spread within the root fragment
        let root_fragment_name = field_metadata
            .fragment_name
            .expect("has_root_fragment() returned true");

        if let Some(root_fragment) = self.program.fragment(root_fragment_name)
            && !selections_contain_fragment_spread(&root_fragment.selections, return_fragment.item)
        {
            self.errors.push(Diagnostic::error(
                ValidationMessage::ReturnFragmentNotSpreadInRootFragment {
                    return_fragment_name: return_fragment.item,
                    root_fragment_name,
                },
                location,
            ));
        }
    }
}

/// Checks if a fragment with the given name is spread within the selections.
/// This recursively traverses into linked fields, inline fragments, and conditions,
/// but does NOT traverse into other fragment definitions (fragment spreads).
fn selections_contain_fragment_spread(
    selections: &[Selection],
    fragment_name: FragmentDefinitionName,
) -> bool {
    struct FragmentSpreadFinder {
        target_name: FragmentDefinitionName,
        found: bool,
    }

    impl Visitor for FragmentSpreadFinder {
        const NAME: &'static str = "FragmentSpreadFinder";
        const VISIT_ARGUMENTS: bool = false;
        const VISIT_DIRECTIVES: bool = false;

        fn visit_fragment_spread(&mut self, spread: &graphql_ir::FragmentSpread) {
            // Check if this is the fragment we're looking for
            if spread.fragment.item == self.target_name {
                self.found = true;
            }
            // Do NOT call default_visit_fragment_spread or traverse into the fragment definition
        }
    }

    let mut finder = FragmentSpreadFinder {
        target_name: fragment_name,
        found: false,
    };
    finder.visit_selections(selections);
    finder.found
}

impl Transformer<'_> for ShadowResolversTransform<'_> {
    const NAME: &'static str = "ShadowResolversTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(
        &mut self,
        field: &graphql_ir::ScalarField,
    ) -> Transformed<graphql_ir::Selection> {
        // Check for RelayResolverFieldMetadata attached by field_transform
        if let Some(field_metadata) = RelayResolverFieldMetadata::find(&field.directives) {
            self.validate_resolver_metadata(field_metadata, field.definition.item);
        }
        Transformed::Keep
    }

    fn transform_linked_field(
        &mut self,
        field: &graphql_ir::LinkedField,
    ) -> Transformed<graphql_ir::Selection> {
        // Check for RelayResolverFieldMetadata attached by field_transform
        if let Some(field_metadata) = RelayResolverFieldMetadata::find(&field.directives) {
            self.validate_resolver_metadata(field_metadata, field.definition.item);
        }
        self.default_transform_linked_field(field)
    }
}
