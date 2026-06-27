/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Condition;
use graphql_ir::Directive;
use graphql_ir::Field as IrField;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::TransformedValue;
use graphql_ir::Transformer;
use graphql_ir::VariableName;
use intern::string_key::StringKey;
use schema::FieldID;
use schema::Schema;
use schema::Type;

use super::RelayResolverFieldMetadata;
use super::RelayResolverMetadata;
use super::ResolversPipeline;
use super::ShadowReturnMarker;
use super::ValidationMessage;
use crate::ClientEdgeMetadata;

/// Convert fields with attached Relay Resolver metadata into the fragment
/// spread of their data dependencies (root fragment). Their
/// `RelayResolverMetadata` IR directive is left attached to this fragment
/// spread.
///
/// For resolvers without a fragment (for example @live resolvers that read from
/// an external source, or resolvers which are simply a function of their
/// arguments) the field is transformed into a `__id` field with the
/// `RelayResolverMetadata` IR directive attached.
///
/// # Magic-fragment transplant
///
/// For a magic fragment (one declaring a `@returnFragment`), the consumer's
/// selections on the resolver field must be fetched from the *shadowed server
/// field* in the main operation -- not via a waterfall. To do that, this
/// transform transplants the consumer's selections onto a per-use-site copy of
/// the shadowed field from the resolver's (generic, shared) root fragment.
///
/// Concretely, when a client-edge use site backs a magic fragment, we keep the
/// backing field as the named spread of the generic root fragment (so the
/// resolver still reads `page { id __typename }` for its pointer) and *also*
/// emit a sibling copy of the shadowed field filled with `id __typename` plus
/// the consumer's selections (e.g. `page { id __typename title }`). After
/// fragment inlining and flatten, the generic `page { id __typename }` and the
/// transplanted `page { id __typename title }` merge into one server selection
/// in the main operation. The shared root fragment definition is never mutated,
/// so distinct consumers (one selecting `title`, another `name`) do not collide.
///
/// The transplant is **normalization-only**: it is emitted only when this
/// transform feeds the operation pipeline (`ResolversPipeline::ForOperation`).
/// In the reader/typegen pipeline (`ResolversPipeline::ForReader`) it is
/// suppressed, so the transplanted server field never reaches the consumer's
/// reader fragment or its public `$data` (which would defeat masking -- the
/// consumer selected only the resolver field, not `page`). The consumer reads
/// its selections off the resolver-returned pointer via the client-edge reader
/// selections.
pub(super) fn relay_resolvers_spread_transform(
    program: &Program,
    pipeline: ResolversPipeline,
    enable_shadow_resolvers: bool,
) -> DiagnosticsResult<Program> {
    let mut transform =
        RelayResolverSpreadTransform::new(program, pipeline, enable_shadow_resolvers);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct RelayResolverSpreadTransform<'program> {
    program: &'program Program,
    pipeline: ResolversPipeline,
    /// Whether the magic-fragment feature is enabled for this project. When
    /// false, the shadow transplant is skipped entirely and this transform
    /// produces the same output as the default (lazy) selection transform.
    enable_shadow_resolvers: bool,
    errors: Vec<Diagnostic>,
}

impl<'program> RelayResolverSpreadTransform<'program> {
    fn new(
        program: &'program Program,
        pipeline: ResolversPipeline,
        enable_shadow_resolvers: bool,
    ) -> Self {
        Self {
            program,
            pipeline,
            enable_shadow_resolvers,
            errors: Default::default(),
        }
    }

    fn transformed_field(&self, field: &impl IrField) -> Option<Selection> {
        RelayResolverFieldMetadata::find(field.directives()).map(|field_metadata| {
            let fragment_definition = field_metadata.fragment_name.map(|fragment_name| {
                self.program
                    .fragment(fragment_name)
                    .expect("Previous validation passes ensured this exists.")
            });

            let (fragment_arguments, field_arguments) =
                field.arguments().iter().cloned().partition(|arg| {
                    if let Some(fragment_definition) = fragment_definition {
                        fragment_definition
                            .variable_definitions
                            .named(VariableName(arg.name.item.0))
                            .is_some()
                    } else {
                        false
                    }
                });

            let resolver_metadata = RelayResolverMetadata {
                import_path: field_metadata.import_path,
                import_name: field_metadata.import_name,
                field_alias: field.alias().map(|field_alias| field_alias.item),
                field_path: field_metadata.field_path,
                field_id: field.definition().item,
                field_arguments,
                fragment_arguments: fragment_arguments.clone(),
                live: field_metadata.live,
                output_type_info: field_metadata.output_type_info.clone(),
                fragment_data_injection_mode: field_metadata
                    .fragment_data_injection_mode
                    .as_ref()
                    .map(|injection_mode| {
                        (
                            self.program
                                .fragment(
                                    field_metadata
                                        .fragment_name
                                        .expect("Expected to have a fragment name."),
                                )
                                .expect("Expect to have a fragment node.")
                                .name,
                            *injection_mode,
                        )
                    }),
                type_confirmed: field_metadata.type_confirmed,
                resolver_type: field_metadata.resolver_type,
                return_fragment: field_metadata.return_fragment,
            };

            let mut new_directives: Vec<Directive> = vec![resolver_metadata.into()];

            for directive in field.directives() {
                if directive.name.item != RelayResolverFieldMetadata::directive_name() {
                    new_directives.push(directive.clone())
                }
            }
            if let Some(fragment_definition) = fragment_definition {
                Selection::FragmentSpread(Arc::new(FragmentSpread {
                    fragment: fragment_definition.name,
                    arguments: fragment_arguments,
                    signature: Some(fragment_definition.as_ref().into()),
                    directives: new_directives,
                }))
            } else {
                Selection::ScalarField(Arc::new(ScalarField {
                    alias: None,
                    definition: WithLocation::generated(self.program.schema.clientid_field()),
                    arguments: vec![],
                    directives: new_directives,
                }))
            }
        })
    }

    /// If `metadata` describes a magic-fragment client edge, build the
    /// per-use-site transplant: a clone of the **full root-fragment path** from
    /// the root fragment down to the shadowed server field, with the consumer's
    /// selections appended at the marked field. Returns `None` for non-magic-fragment
    /// edges, or an empty `Vec` only on a (validated) error.
    ///
    /// The returned selections are emitted as *siblings* of the client-edge
    /// inline fragment so the transplanted server path lands in the consumer
    /// operation's normalization and merges (via flatten) with the generic
    /// path contributed by the root-fragment spread.
    ///
    /// The whole ancestor path matters. For a root fragment
    /// `User { friend { page { ...Return } } }` the transplant must reproduce
    /// `friend { page { id __typename <consumer> } }`, not just `page { ... }`
    /// hoisted to the consumer parent (which would normalize the consumer's
    /// selections under the wrong record). Likewise every ancestor's directives
    /// and arguments (e.g. `page @include(if: $x)` for an incremental-migration
    /// gate, or `friend(first: 1)`) must be preserved -- dropping an `@include`
    /// would fetch the shadowed field unconditionally.
    ///
    /// At the marked (leaf) field we keep its own pointer selections
    /// (`id __typename`, auto-injected by the shadow-return conversion), append
    /// the consumer's selections re-bound onto the shadowed server type, and
    /// strip the `ShadowReturnMarker` so the transplant is a plain server path.
    ///
    /// The consumer authors its selections against the resolver's interface
    /// return type (e.g. `IPage`), so each field is re-bound by name onto the
    /// shadowed server type (e.g. `Page`). Without this the consumer's `title`
    /// would carry the client-extension `IPage.title` field id and be emitted as
    /// a `ClientExtension` (never fetched from the server).
    fn shadow_transplant_selection(
        &mut self,
        metadata: &ClientEdgeMetadata<'_>,
    ) -> Option<Vec<Selection>> {
        let field_metadata = RelayResolverFieldMetadata::find(metadata.backing_field.directives())?;
        let return_fragment = field_metadata.return_fragment?;
        // A magic fragment (one declaring a `@returnFragment`) is required to
        // also declare a `@rootFragment` (enforced by the
        // `ReturnFragmentRequiresRootFragment` validation), and that root fragment
        // must be present in the program by the time the spread transform runs. A
        // missing root fragment here is therefore a compiler bug, not a user
        // error -- fail loudly rather than silently skipping the transplant
        // (which would drop the consumer's selections from the main operation).
        let root_fragment_name = field_metadata
            .fragment_name
            .expect("shadow resolver with @returnFragment must declare a @rootFragment");
        let root_fragment = self.program.fragment(root_fragment_name).unwrap_or_else(|| {
            panic!("shadow resolver root fragment `{root_fragment_name}` must be present in the program")
        });

        // Clone the root-fragment path from the root down to the shadowed field
        // (the one carrying the `ShadowReturnMarker` for this resolver's return
        // fragment), preserving every ancestor linked field / inline fragment /
        // condition along with its directives and arguments. At the marked field
        // we splice in the consumer's selections (re-bound onto the shadowed
        // server type). Returns `None` (no marker found) only on an unvalidated
        // magic-fragment edge, which earlier validation passes prevent.
        self.clone_shadowed_path(
            &root_fragment.selections,
            return_fragment.item,
            &metadata.linked_field.selections,
        )
    }

    /// Clone the path through `selections` that reaches the field marked with the
    /// `ShadowReturnMarker` for `return_fragment_name`, preserving every ancestor
    /// linked field / inline fragment / condition (and their directives and
    /// arguments). At the marked field, replace its selections with its own
    /// pointer selections (`id __typename`) plus the consumer's selections
    /// re-bound onto the shadowed server type, and strip the marker directive.
    ///
    /// Returns `Some` with the cloned path's top-level selections when the marked
    /// field is found on this branch, `None` otherwise. Only the path to the
    /// marker is cloned -- sibling selections that don't reach the marker are
    /// dropped (the resolver's own pointer read still comes from the generic
    /// root-fragment spread).
    fn clone_shadowed_path(
        &mut self,
        selections: &[Selection],
        return_fragment_name: FragmentDefinitionName,
        consumer_selections: &[Selection],
    ) -> Option<Vec<Selection>> {
        for selection in selections {
            match selection {
                Selection::LinkedField(field) => {
                    if let Some(marker) = ShadowReturnMarker::find(&field.directives)
                        && marker.return_fragment_name == return_fragment_name
                    {
                        // This is the shadowed (leaf) field. Re-bind the
                        // consumer's selections onto the shadowed server type,
                        // append them to the field's own pointer selections
                        // (`id __typename`), and strip the marker.
                        let shadowed_type = self
                            .program
                            .schema
                            .field(field.definition.item)
                            .type_
                            .inner();
                        let rebound = self.rebind_selections(consumer_selections, shadowed_type);

                        let mut new_selections = field.selections.clone();
                        new_selections.extend(rebound);

                        let directives = field
                            .directives
                            .iter()
                            .filter(|directive| {
                                directive.name.item != ShadowReturnMarker::directive_name()
                            })
                            .cloned()
                            .collect();

                        return Some(vec![Selection::LinkedField(Arc::new(LinkedField {
                            directives,
                            selections: new_selections,
                            ..field.as_ref().clone()
                        }))]);
                    }
                    // Recurse: if the marker is somewhere below this linked
                    // field, clone this ancestor (keeping its directives and
                    // arguments) wrapping the cloned sub-path.
                    if let Some(inner) = self.clone_shadowed_path(
                        &field.selections,
                        return_fragment_name,
                        consumer_selections,
                    ) {
                        return Some(vec![Selection::LinkedField(Arc::new(LinkedField {
                            selections: inner,
                            ..field.as_ref().clone()
                        }))]);
                    }
                }
                Selection::InlineFragment(fragment) => {
                    if let Some(inner) = self.clone_shadowed_path(
                        &fragment.selections,
                        return_fragment_name,
                        consumer_selections,
                    ) {
                        return Some(vec![Selection::InlineFragment(Arc::new(InlineFragment {
                            selections: inner,
                            ..fragment.as_ref().clone()
                        }))]);
                    }
                }
                Selection::Condition(condition) => {
                    if let Some(inner) = self.clone_shadowed_path(
                        &condition.selections,
                        return_fragment_name,
                        consumer_selections,
                    ) {
                        return Some(vec![Selection::Condition(Arc::new(Condition {
                            selections: inner,
                            ..condition.as_ref().clone()
                        }))]);
                    }
                }
                Selection::ScalarField(_) | Selection::FragmentSpread(_) => {}
            }
        }
        None
    }

    /// Re-bind a consumer's selection set, authored against the resolver's
    /// interface return type, onto `parent_type` (the shadowed server type).
    /// Scalar and linked fields are looked up by name on `parent_type`; inline
    /// fragments and conditions recurse. Selections that have no counterpart on
    /// the shadowed type, and fragment spreads, produce a focused validation
    /// error (rather than silently being dropped or mis-namespaced).
    fn rebind_selections(&mut self, selections: &[Selection], parent_type: Type) -> Vec<Selection> {
        selections
            .iter()
            .filter_map(|selection| self.rebind_selection(selection, parent_type))
            .collect()
    }

    fn rebind_selection(&mut self, selection: &Selection, parent_type: Type) -> Option<Selection> {
        match selection {
            Selection::ScalarField(field) => {
                let field_name = self.program.schema.field(field.definition.item).name.item;
                let definition =
                    self.rebind_field(field_name, parent_type, field.alias_or_name_location())?;
                Some(Selection::ScalarField(Arc::new(ScalarField {
                    definition: WithLocation::new(field.definition.location, definition),
                    ..field.as_ref().clone()
                })))
            }
            Selection::LinkedField(field) => {
                let field_name = self.program.schema.field(field.definition.item).name.item;
                let definition =
                    self.rebind_field(field_name, parent_type, field.alias_or_name_location())?;
                let inner_type = self.program.schema.field(definition).type_.inner();
                let selections = self.rebind_selections(&field.selections, inner_type);
                Some(Selection::LinkedField(Arc::new(LinkedField {
                    definition: WithLocation::new(field.definition.location, definition),
                    selections,
                    ..field.as_ref().clone()
                })))
            }
            Selection::InlineFragment(fragment) => {
                // Sort an explicit type condition before rebinding. The transplant
                // fetches from the shadowed SERVER field, so where an inline
                // fragment goes depends on how its type condition relates to that
                // server type:
                //
                // - A client-extension arm (e.g. `... on ClientPage`) is DROPPED
                //   from the transplant. Its data is read through the model edge
                //   minted in `client_edges` and stays in the client-edge reader
                //   selections; the server never returns that client-only
                //   refinement, so transplanting it would be meaningless.
                // - A server arm that overlaps the shadowed type is transplanted
                //   unchanged.
                // - A non-overlapping server arm (e.g. `... on Comment` under a
                //   `Page`) can never match and is a genuine error.
                if let Some(type_condition) = fragment.type_condition {
                    match self.classify_inline_fragment_type(type_condition, parent_type) {
                        MagicFragmentInlineFragmentArm::DropClientExtension => return None,
                        MagicFragmentInlineFragmentArm::Incompatible => {
                            self.errors.push(Diagnostic::error(
                                ValidationMessage::ShadowReturnIncompatibleInlineFragmentType {
                                    type_condition_name: self
                                        .program
                                        .schema
                                        .get_type_name(type_condition),
                                    type_name: self.program.schema.get_type_name(parent_type),
                                },
                                fragment.spread_location,
                            ));
                            return None;
                        }
                        MagicFragmentInlineFragmentArm::TransplantServer => {}
                    }
                }
                // Keep the type condition; recurse using it (or the parent type
                // when there is no explicit condition).
                let inner_type = fragment.type_condition.unwrap_or(parent_type);
                let selections = self.rebind_selections(&fragment.selections, inner_type);
                Some(Selection::InlineFragment(Arc::new(InlineFragment {
                    selections,
                    ..fragment.as_ref().clone()
                })))
            }
            Selection::Condition(condition) => {
                let selections = self.rebind_selections(&condition.selections, parent_type);
                Some(Selection::Condition(Arc::new(Condition {
                    selections,
                    ..condition.as_ref().clone()
                })))
            }
            Selection::FragmentSpread(spread) => {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::ShadowReturnUnsupportedFragmentSpread,
                    spread.fragment.location,
                ));
                None
            }
        }
    }

    /// Look up `field_name` on `parent_type` (the shadowed server type),
    /// returning its `FieldID`. Reports a focused error if the shadowed type does
    /// not define the field.
    fn rebind_field(
        &mut self,
        field_name: StringKey,
        parent_type: Type,
        location: Location,
    ) -> Option<FieldID> {
        match self.program.schema.named_field(parent_type, field_name) {
            Some(field_id) => Some(field_id),
            None => {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::ShadowReturnSelectionNotOnShadowedType {
                        field_name,
                        type_name: self.program.schema.get_type_name(parent_type),
                    },
                    location,
                ));
                None
            }
        }
    }

    /// Classify how an inline fragment's `type_condition` relates to
    /// `parent_type` (the shadowed server type, e.g. `Page`) for the transplant.
    ///
    /// The shadowed return type is an interface that can be implemented by both
    /// server types and client-extension model types. `relay_resolvers_abstract_types`
    /// expands the consumer's selection into one typed inline arm per concrete
    /// implementor, so the transplant sees each arm separately:
    ///
    /// - A client-extension condition (e.g. `... on ClientPage`,
    ///   `is_extension_type`) is DROPPED from the transplant — it is satisfied by
    ///   the model edge minted in `client_edges` and read off the client-edge
    ///   reader selections, never fetched from the server.
    /// - A server condition that overlaps the shadowed type is TRANSPLANTED.
    /// - A server condition that can never match (e.g. `... on Comment` under a
    ///   `Page`) is INCOMPATIBLE — a genuine error.
    fn classify_inline_fragment_type(
        &self,
        type_condition: Type,
        parent_type: Type,
    ) -> MagicFragmentInlineFragmentArm {
        let schema = &self.program.schema;
        if schema.is_extension_type(type_condition) {
            MagicFragmentInlineFragmentArm::DropClientExtension
        } else if schema.are_overlapping_types(type_condition, parent_type) {
            MagicFragmentInlineFragmentArm::TransplantServer
        } else {
            MagicFragmentInlineFragmentArm::Incompatible
        }
    }
}

/// How a consumer inline-fragment arm relates to the shadowed server type during
/// the magic-fragment transplant. See `classify_inline_fragment_type`.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum MagicFragmentInlineFragmentArm {
    /// Client-extension refinement: dropped from the server transplant, served by
    /// the model edge minted in `client_edges`.
    DropClientExtension,
    /// Server refinement overlapping the shadowed type: transplanted unchanged.
    TransplantServer,
    /// Server refinement that can never match the shadowed type: a genuine error.
    Incompatible,
}

impl<'program> Transformer<'program> for RelayResolverSpreadTransform<'program> {
    const NAME: &'static str = "RelayResolversSpreadTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_selections(
        &mut self,
        selections: &'program [Selection],
    ) -> TransformedValue<Vec<Selection>> {
        // Lazy strategy mirroring the base `Transformer::transform_list`: keep
        // `next_selections` as `None` until a change is actually produced, then
        // back-fill the already-kept prefix and switch to eager. This transform
        // runs over every selection set in the program on each of the
        // reader/operation/typegen passes, so the common no-op case must stay
        // zero-allocation (the previous `Vec::with_capacity` + per-`Keep` clone
        // allocated for every selection set regardless of whether anything
        // changed).
        let mut next_selections: Option<Vec<Selection>> = None;
        for (index, selection) in selections.iter().enumerate() {
            // For a magic-fragment client edge, emit the transplant copy of the
            // shadowed server field as a sibling of the (normally-transformed)
            // client-edge inline fragment, so the consumer's selections reach
            // the main operation's normalization (merging via flatten with the
            // generic `page { id __typename }` from the root-fragment spread).
            //
            // This is NORMALIZATION-ONLY: we only emit the transplant in the
            // operation pipeline (`ForOperation`). In the reader/typegen pipeline
            // (`ForReader`) the transplant is suppressed so it stays out of the
            // reader fragment and the consumer's public `$data` -- there the
            // consumer reads its selections off the resolver-returned pointer via
            // the client-edge reader selections, never off this sibling field.
            // Emitting it in the reader would pollute `$data` and defeat masking.
            //
            // Gated on `enable_shadow_resolvers` so non-adopting projects pay
            // nothing here (no `ClientEdgeMetadata::find` / transplant probe per
            // inline fragment): a valid magic fragment can only exist when the
            // feature is enabled.
            if self.enable_shadow_resolvers
                && self.pipeline == ResolversPipeline::ForOperation
                && let Selection::InlineFragment(fragment) = selection
                && let Some(metadata) = ClientEdgeMetadata::find(fragment)
                && let Some(transplant) = self.shadow_transplant_selection(&metadata)
            {
                let next = next_selections.get_or_insert_with(|| selections[..index].to_vec());
                let transformed = self
                    .transform_inline_fragment(fragment)
                    .unwrap_or_else(|| selection.clone());
                next.push(transformed);
                // `transplant` is the cloned root-fragment path (a single
                // top-level selection wrapping the shadowed field's ancestor
                // chain), spliced as a sibling so it normalizes into the
                // consumer operation alongside the generic root-fragment spread.
                next.extend(transplant);
                continue;
            }
            match self.transform_selection(selection) {
                Transformed::Keep => {
                    if let Some(next) = next_selections.as_mut() {
                        next.push(selection.clone());
                    }
                }
                Transformed::Delete => {
                    next_selections.get_or_insert_with(|| selections[..index].to_vec());
                }
                Transformed::Replace(replacement) => {
                    next_selections
                        .get_or_insert_with(|| selections[..index].to_vec())
                        .push(replacement);
                }
            }
        }
        match next_selections {
            Some(next) => TransformedValue::Replace(next),
            None => TransformedValue::Keep,
        }
    }

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        match self.transformed_field(field) {
            Some(selection) => Transformed::Replace(selection),
            None => Transformed::Keep,
        }
    }

    fn transform_linked_field(&mut self, field: &'program LinkedField) -> Transformed<Selection> {
        match self.transformed_field(field) {
            Some(selection) => Transformed::Replace(selection),
            None => self.default_transform_linked_field(field),
        }
    }

    fn transform_inline_fragment(
        &mut self,
        fragment: &'program graphql_ir::InlineFragment,
    ) -> Transformed<Selection> {
        match ClientEdgeMetadata::find(fragment) {
            Some(client_edge_metadata) => {
                let backing_id_field = self
                    .transform_selection(client_edge_metadata.backing_field)
                    .unwrap_or_else(|| client_edge_metadata.backing_field.clone());

                let selections_field = self
                    .default_transform_linked_field(client_edge_metadata.linked_field)
                    .unwrap_or_else(|| {
                        Selection::LinkedField(Arc::new(client_edge_metadata.linked_field.clone()))
                    });

                let selections = vec![backing_id_field, selections_field];

                Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                    selections,
                    ..fragment.clone()
                })))
            }
            None => self.default_transform_inline_fragment(fragment),
        }
    }
}
