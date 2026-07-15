/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;
use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::FeatureFlags;
use common::NamedItem;
use docblock_shared::SHADOW_RETURN_DIRECTIVE_NAME;
use docblock_shared::SHADOW_RETURN_FRAGMENT_ARGUMENT_NAME;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::Visitor;
use graphql_syntax::is_valid_identifier;
use intern::Lookup;
use intern::string_key::StringKey;
use schema::FieldID;
use schema::Schema;
use schema::Type;

use super::RelayResolverFieldMetadata;
use super::ShadowReturnMarker;
use super::ValidationMessage;
use crate::extract_module_name;

/// Shadow resolvers transform.
///
/// This transform validates `@returnFragment` on resolver fields. It runs after
/// the field transform (which attaches `RelayResolverFieldMetadata`) but before
/// the spread transform (which converts fields to fragment spreads).
///
/// It also converts the schema-known internal `@__relay_shadow_return` directive
/// (added before `build_ir` in place of the `@returnFragment` placeholder spread)
/// into the typed IR associated-data marker `ShadowReturnMarker`, and strips the
/// syntax directive so it never reaches codegen / artifacts.
pub(super) fn shadow_resolvers_transform(
    program: &Program,
    feature_flags: &FeatureFlags,
    id_field_name: StringKey,
) -> DiagnosticsResult<Program> {
    let mut transform = ShadowResolversTransform::new(program, feature_flags, id_field_name);
    let next_program = transform.transform_program(program);

    if transform.errors.is_empty() {
        Ok(next_program.replace_or_else(|| program.clone()))
    } else {
        Err(transform.errors)
    }
}

struct ShadowResolversTransform<'program> {
    program: &'program Program,
    feature_flags: &'program FeatureFlags,
    /// The project's `node_interface_id_field`, used to classify the
    /// return-type flavor (concrete `@weak` / non-Node server VALUE /
    /// abstract-inline): for the concrete-object gate exemption and the
    /// plural-support decision.
    id_field_name: StringKey,
    errors: Vec<Diagnostic>,
    /// Track which resolver fields have been validated to avoid duplicate validation
    validated_fields: HashSet<FieldID>,
}

impl<'program> ShadowResolversTransform<'program> {
    fn new(
        program: &'program Program,
        feature_flags: &'program FeatureFlags,
        id_field_name: StringKey,
    ) -> Self {
        Self {
            program,
            feature_flags,
            id_field_name,
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

        // Plural magic fragments: only the STRONG (Node pointer / `EdgeTo`) flavor
        // is supported. Its consumer selections are transplanted onto the shadowed
        // server LIST field in the main operation, normalized as N records, and the
        // resolver returns a list of pointers the reader reads off each record in
        // place. The inline flavors (concrete `@weak`, non-Node server VALUE
        // read-in-place, and abstract interfaces with a weak/value implementor)
        // have no per-item store record to read a list from, so they stay gated.
        // (The plural + `@waterfall` rejection lives in `client_edges`: `@waterfall`
        // is a per-use-site directive this schema-level, per-`FieldID`-deduped
        // validation cannot see.)
        let schema_field = self.program.schema.field(field_id);
        if schema_field.type_.is_list() {
            let inner = schema_field.type_.inner();
            let schema = self.program.schema.as_ref();
            let is_inline_flavor =
                relay_schema::definitions::weak_object_instance_field(schema, inner).is_some()
                    || relay_schema::definitions::is_server_weak_shadow_return(
                        schema,
                        inner,
                        self.id_field_name,
                        true,
                    )
                    || relay_schema::definitions::abstract_shadow_return_has_inline_implementor(
                        schema,
                        inner,
                        self.id_field_name,
                        true,
                    );
            if is_inline_flavor || !inner.is_composite_type() {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::ShadowResolverPluralUnsupported,
                    location,
                ));
                return;
            }
        }

        // Union magic fragment return types are not supported. A union member
        // can be a client-extension type, whose data must be read through the
        // model-resolver edge in `client_edges`. That edge needs the consumer's
        // selection expanded into per-member typed inline fragments, but
        // `relay_resolvers_abstract_types` only expands interfaces, not unions,
        // so the client member's selections would have nowhere to go. Gate it at
        // the compiler; use an interface return type instead.
        if let Type::Union(union_id) = schema_field.type_.inner() {
            self.errors.push(Diagnostic::error(
                ValidationMessage::MagicFragmentUnionReturnUnsupported {
                    field_name: schema_field.name.item,
                    union_name: self.program.schema.union(union_id).name.item.0,
                },
                location,
            ));
            return;
        }

        // A magic fragment's return type must be an interface, not a CONCRETE
        // OBJECT -- EXCEPT the read-in-place inline flavors, which have no
        // implementors to fan and are read directly off the backing record: a
        // concrete `@weak` model is read off `<Type>____relay_model_instance`,
        // so it has no pointer and needs no per-`__typename` fan-out. Any other
        // concrete object DOES need the interface fan-out (its consumer selection
        // is dispatched at read time on the resolver's returned `__typename`); a
        // concrete object has no implementors to fan, so `client_edges` finds no
        // abstract members (`abstract_type_members` returns `None`) and would
        // silently drop the magic-fragment routing. Gate those here with a
        // focused error instead of emitting a broken artifact. (List and union
        // returns are already rejected above; non-composite returns like
        // `RelayResolverValue` fail their own validation paths.)
        let inner = schema_field.type_.inner();
        // Inline flavors are read directly off the backing record, so they have
        // no implementors to fan and are exempt from the interface-only gate: a
        // concrete `@weak` model (read off `<Type>____relay_model_instance`) or a
        // non-Node server VALUE type (read off `__id`, e.g. `PageStats`).
        let is_inline_object_flavor = relay_schema::definitions::weak_object_instance_field(
            self.program.schema.as_ref(),
            inner,
        )
        .is_some()
            || relay_schema::definitions::is_server_weak_shadow_return(
                self.program.schema.as_ref(),
                inner,
                self.id_field_name,
                true,
            );
        if matches!(inner, Type::Object(_)) && !is_inline_object_flavor {
            self.errors.push(Diagnostic::error(
                ValidationMessage::MagicFragmentConcreteObjectReturnUnsupported {
                    field_name: schema_field.name.item,
                    type_name: self.program.schema.get_type_name(inner),
                },
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

        // Validate: return fragment must be spread within the root fragment.
        //
        // The `@returnFragment` placeholder spread is converted into the
        // schema-known internal `@__relay_shadow_return` directive at the AST
        // rail (before `build_ir`). So we look for that marker directive (keyed
        // on the return fragment name), not the original spread, which no longer
        // exists by the time we reach IR.
        let root_fragment_name = field_metadata
            .fragment_name
            .expect("has_root_fragment() returned true");

        if let Some(root_fragment) = self.program.fragment(root_fragment_name)
            && !selections_contain_shadow_return_marker(
                &root_fragment.selections,
                return_fragment.item,
            )
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

/// Read the `fragment` argument off a `@__relay_shadow_return` directive (the
/// internal marker emitted before `build_ir` in place of the `@returnFragment`
/// placeholder spread). Returns the return fragment name it carries.
fn shadow_return_directive_fragment_name(field: &LinkedField) -> Option<FragmentDefinitionName> {
    field
        .directives
        .named(*SHADOW_RETURN_DIRECTIVE_NAME)
        .and_then(|directive| {
            directive
                .arguments
                .named(*SHADOW_RETURN_FRAGMENT_ARGUMENT_NAME)
        })
        .and_then(|arg| arg.value.item.get_string_literal())
        .map(FragmentDefinitionName)
}

/// Checks if the shadow-return marker for the given return fragment is present
/// within the selections. The `@returnFragment` placeholder spread is converted
/// before `build_ir` into the `@__relay_shadow_return` directive on the shadowed
/// linked field, so we look for that directive (carrying the matching return
/// fragment name) rather than the original spread. Recursively traverses into
/// linked fields, inline fragments, and conditions, but does NOT traverse into
/// other fragment definitions (fragment spreads).
fn selections_contain_shadow_return_marker(
    selections: &[Selection],
    return_fragment_name: FragmentDefinitionName,
) -> bool {
    struct ShadowReturnMarkerFinder {
        target_name: FragmentDefinitionName,
        found: bool,
    }

    impl Visitor for ShadowReturnMarkerFinder {
        const NAME: &'static str = "ShadowReturnMarkerFinder";
        const VISIT_ARGUMENTS: bool = false;
        const VISIT_DIRECTIVES: bool = false;

        fn visit_linked_field(&mut self, field: &LinkedField) {
            if shadow_return_directive_fragment_name(field) == Some(self.target_name) {
                self.found = true;
            }
            self.default_visit_linked_field(field);
        }

        fn visit_fragment_spread(&mut self, _spread: &graphql_ir::FragmentSpread) {
            // Do NOT traverse into the spread fragment definition.
        }
    }

    let mut finder = ShadowReturnMarkerFinder {
        target_name: return_fragment_name,
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

        // Convert the schema-known `@__relay_shadow_return` syntax directive into
        // the typed associated-data marker and strip the syntax directive so it
        // never reaches codegen.
        if let Some(return_fragment_name) = shadow_return_directive_fragment_name(field) {
            let shadow_return_directive = field
                .directives
                .named(*SHADOW_RETURN_DIRECTIVE_NAME)
                .expect("shadow_return_directive_fragment_name matched the directive");
            let marker = ShadowReturnMarker {
                return_fragment_name,
                spread_location: shadow_return_directive.location,
            };
            let mut directives: Vec<_> = field
                .directives
                .iter()
                .filter(|directive| directive.name.item != *SHADOW_RETURN_DIRECTIVE_NAME)
                .cloned()
                .collect();
            directives.push(marker.into());
            let selections = self
                .transform_selections(&field.selections)
                .replace_or_else(|| field.selections.clone());
            return Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
                directives,
                selections,
                ..field.clone()
            })));
        }

        self.default_transform_linked_field(field)
    }
}
