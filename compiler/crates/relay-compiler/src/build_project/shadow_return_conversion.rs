/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Pre-`build_ir` conversion for shadow-resolver "magic fragment" placeholders.
//!
//! A shadow resolver authors a placeholder spread (`...ReturnFragment`, named by
//! the resolver's `@returnFragment`) inside its `@rootFragment` to mark the
//! shadowed server field whose selections the consumer wants fetched. That
//! placeholder references a fragment that is never defined, so it would trip
//! `build_ir`'s undefined-fragment validation. To avoid that, this module runs
//! while the documents are still raw `graphql_syntax` ASTs (before `build_ir`)
//! and rewrites the placeholder into the schema-known internal directive
//! `@__relay_shadow_return(fragment: "...")` on the enclosing shadowed field,
//! injecting `id __typename` (the pointer the resolver returns).
//!
//! The directive must be schema-known precisely because it is introduced before
//! `build_ir`, which validates directives against the schema. It is later lowered
//! to the typed IR marker `ShadowReturnMarker` and stripped before codegen (see
//! `relay_transforms::relay_resolvers` and `shadow_transform`).

use common::Diagnostic;
use common::Location;
use common::Span;
use docblock_shared::SHADOW_RETURN_DIRECTIVE_NAME;
use docblock_shared::SHADOW_RETURN_FRAGMENT_ARGUMENT_NAME;
use fnv::FnvHashMap;
use graphql_ir::FragmentDefinitionName;
use graphql_syntax::ConstantValue;
use graphql_syntax::Directive;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::Identifier;
use graphql_syntax::List;
use graphql_syntax::ScalarField;
use graphql_syntax::Selection;
use graphql_syntax::StringNode;
use graphql_syntax::Token;
use graphql_syntax::TokenKind;
use graphql_syntax::Value;
use intern::Lookup;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use relay_schema::definitions::abstract_shadow_return_inline_kind;
use relay_schema::definitions::is_server_value_object;
use relay_transforms::ValidationMessage;
use relay_transforms::get_resolver_fragment_dependency_name;
use relay_transforms::get_resolver_return_fragment_name;
use schema::SDLSchema;
use schema::Schema;

/// Reject any user-authored `@__relay_shadow_return` directive.
///
/// `@__relay_shadow_return` is internal to the compiler: it is injected by
/// [`convert_shadow_return_fragment_spreads`] and later lowered to a trusted IR
/// marker. If a product author could write it directly, they could mint the
/// trusted shadow-return marker without going through the `...ReturnFragment`
/// authoring form, bypassing the shadow-resolver contract. Run this BEFORE the
/// conversion injects the directive, so every occurrence found here is
/// necessarily user-authored.
pub(crate) fn reject_user_authored_shadow_return_directive(
    definitions: &[ExecutableDefinition],
) -> Result<(), Vec<Diagnostic>> {
    let mut errors = Vec::new();
    for definition in definitions {
        let location = definition.location();
        let definition_directives = match definition {
            ExecutableDefinition::Operation(operation) => &operation.directives,
            ExecutableDefinition::Fragment(fragment) => &fragment.directives,
        };
        collect_shadow_return_directive_errors(definition_directives, location, &mut errors);
        collect_shadow_return_directive_errors_in_selections(
            definition.selections(),
            location,
            &mut errors,
        );
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

/// Push an error for every `@__relay_shadow_return` directive in a directive list.
fn collect_shadow_return_directive_errors(
    directives: &[Directive],
    location: Location,
    errors: &mut Vec<Diagnostic>,
) {
    for directive in directives {
        if directive.name.value == SHADOW_RETURN_DIRECTIVE_NAME.0 {
            errors.push(Diagnostic::error(
                ValidationMessage::InternalShadowReturnDirectiveNotAllowed,
                location.with_span(directive.name.span),
            ));
        }
    }
}

/// Recursively push an error for every `@__relay_shadow_return` directive found on
/// any field, inline fragment, or fragment spread within a selection set.
///
/// This runs over the whole program on every build, so it uses a plain recursive
/// walk with a `&mut Vec<Diagnostic>` accumulator rather than chained
/// `Box<dyn Iterator>`s (which allocated once per visited selection set).
fn collect_shadow_return_directive_errors_in_selections(
    selections: &[Selection],
    location: Location,
    errors: &mut Vec<Diagnostic>,
) {
    for selection in selections {
        collect_shadow_return_directive_errors(selection.directives(), location, errors);
        match selection {
            Selection::LinkedField(linked_field) => {
                collect_shadow_return_directive_errors_in_selections(
                    &linked_field.selections.items,
                    location,
                    errors,
                );
            }
            Selection::InlineFragment(inline_fragment) => {
                collect_shadow_return_directive_errors_in_selections(
                    &inline_fragment.selections.items,
                    location,
                    errors,
                );
            }
            Selection::FragmentSpread(_) | Selection::ScalarField(_) => {}
        }
    }
}

/// Build a map from each shadow resolver's `@rootFragment` name to a map of its
/// `@returnFragment` ("magic fragment") names → the identity field to inject on
/// the shadowed field for that resolver. A shadow resolver is a resolver field
/// that declares both a root fragment and a return fragment.
///
/// The value is a map (not a single entry) because two resolver fields may share
/// the same `@rootFragment` while declaring different `@returnFragment`s; keying
/// by a single value would silently drop one of them, leaving that resolver's
/// placeholder unconverted (and failing later with an undefined-fragment error).
///
/// The injected identity field is the DataID/store key the resolver edge reads
/// off of: `__id` (`schema.clientid_field()`, the universal DataID) for every
/// all-inline return — a non-Node SERVER VALUE (read in place) or an
/// abstract (interface/union) return with ANY inline implementor (`@weak` and/or
/// server VALUE) — and `id` (the `id_field_name`) only for the
/// strong/`EdgeTo` pointer arm (the `node(id:)` refetch arm) and the concrete
/// client-`@weak` arm (whose leaf is a Node, injection handled elsewhere).
///
/// An all-inline abstract return never refetches (the
/// `MagicFragmentMixedInlineAndRefetchableUnsupported` gate guarantees no
/// strong-Node member), so `id` is never needed; `__id` is valid on weak, value,
/// and Node leaves alike. An inline implementor's fields are read off the
/// transplanted record (value) or the model instance (`@weak`); the injected
/// `__id` is the store key for that read.
fn shadow_return_fragments_by_root_fragment(
    schema: &SDLSchema,
    id_field_name: StringKey,
) -> FnvHashMap<FragmentDefinitionName, FnvHashMap<FragmentDefinitionName, StringKey>> {
    let clientid_field_name = schema.field(schema.clientid_field()).name.item;
    let mut by_root: FnvHashMap<
        FragmentDefinitionName,
        FnvHashMap<FragmentDefinitionName, StringKey>,
    > = FnvHashMap::default();
    for field in schema.fields() {
        if let Some(root_fragment) = get_resolver_fragment_dependency_name(field)
            && let Some(return_fragment) = get_resolver_return_fragment_name(field)
        {
            let inner = field.type_.inner();
            // Inject `__id` (the universal DataID) for ANY all-inline return: a
            // concrete server VALUE type, OR an abstract return with any inline
            // (`@weak` and/or non-Node value) implementor. `__id` is selectable on
            // weak, value, and Node leaves alike, and an all-inline return never
            // refetches, so `id` is unnecessary there. (The
            // `MagicFragmentMixedInlineAndRefetchableUnsupported` gate guarantees an
            // abstract return with an inline implementor has no strong-Node member,
            // so an `id`-bearing leaf and an inline implementor never coexist.) Only
            // the strong/Node pointer arm — which refetches via `node(id:)` and has
            // no inline implementor — injects `id`.
            let inject_clientid = is_server_value_object(schema, inner, id_field_name)
                || abstract_shadow_return_inline_kind(schema, inner, id_field_name).is_some();
            let identity_field = if inject_clientid {
                clientid_field_name
            } else {
                id_field_name
            };
            by_root
                .entry(root_fragment)
                .or_default()
                .insert(return_fragment, identity_field);
        }
    }
    by_root
}

/// Convert shadow-resolver `@returnFragment` placeholder spreads into the
/// internal `@__relay_shadow_return` directive on the enclosing shadowed field.
///
/// Runs while the documents are still raw `graphql_syntax` ASTs (before
/// `build_ir`), so the placeholder spread — which references a fragment that is
/// never defined — does not reach `build_ir` and trip its undefined-fragment
/// validation. Covers both project definitions and the appended base resolver
/// fragments.
///
/// The conversion only rewrites a placeholder spread that is a direct child of
/// the shadowed `LinkedField`. Any placeholder that survives the conversion (one
/// placed at the top level of the `@rootFragment`, or inside an inline fragment
/// or condition) would otherwise reach `build_ir` and fail with a generic
/// "Undefined fragment" error. We detect those remaining placeholders here and
/// return a focused diagnostic instead.
pub(crate) fn convert_shadow_return_fragment_spreads(
    schema: &SDLSchema,
    definitions: &mut [ExecutableDefinition],
    id_field_name: StringKey,
) -> Result<(), Vec<Diagnostic>> {
    let return_fragments_by_root = shadow_return_fragments_by_root_fragment(schema, id_field_name);
    if return_fragments_by_root.is_empty() {
        return Ok(());
    }

    let mut errors = Vec::new();
    for definition in definitions.iter_mut() {
        // Capture the location before the mutable borrow of `fragment` below.
        let location = definition.location();
        if let ExecutableDefinition::Fragment(fragment) = definition
            && let Some(return_fragments) =
                return_fragments_by_root.get(&FragmentDefinitionName(fragment.name.value))
        {
            convert_spreads_in_selections(&mut fragment.selections.items, return_fragments);
            collect_misplaced_placeholder_errors(
                &fragment.selections.items,
                return_fragments,
                location,
                &mut errors,
            );
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

/// Recursively walk a (post-conversion) selection set and push a focused
/// diagnostic for every `@returnFragment` placeholder spread that survived the
/// conversion. A surviving placeholder is necessarily misplaced: the conversion
/// only rewrites placeholders that are direct children of the shadowed
/// `LinkedField`, so anything left over sits at the top level of the
/// `@rootFragment`, or inside an inline fragment or condition.
fn collect_misplaced_placeholder_errors(
    selections: &[Selection],
    return_fragments: &FnvHashMap<FragmentDefinitionName, StringKey>,
    location: Location,
    errors: &mut Vec<Diagnostic>,
) {
    for selection in selections {
        match selection {
            Selection::FragmentSpread(spread) => {
                if let Some((return_fragment_name, _)) =
                    matched_placeholder(selection, return_fragments)
                {
                    errors.push(Diagnostic::error(
                        ValidationMessage::ShadowReturnPlaceholderMisplaced {
                            return_fragment_name,
                        },
                        location.with_span(spread.span),
                    ));
                }
            }
            Selection::LinkedField(linked_field) => {
                collect_misplaced_placeholder_errors(
                    &linked_field.selections.items,
                    return_fragments,
                    location,
                    errors,
                );
            }
            Selection::InlineFragment(inline_fragment) => {
                collect_misplaced_placeholder_errors(
                    &inline_fragment.selections.items,
                    return_fragments,
                    location,
                    errors,
                );
            }
            Selection::ScalarField(_) => {}
        }
    }
}

/// Recursively walk a selection set looking for a linked field whose direct
/// child selections include a `@returnFragment` placeholder spread. When found,
/// replace the placeholder with the `@__relay_shadow_return` directive plus the
/// shadowed field's identity selection (`id`/`__id` and `__typename`).
///
/// `return_fragments` maps each of the resolver's `@returnFragment` names to the
/// identity field to inject for that resolver (`__id` for a server-value
/// read-in-place return, `id` otherwise).
fn convert_spreads_in_selections(
    selections: &mut [Selection],
    return_fragments: &FnvHashMap<FragmentDefinitionName, StringKey>,
) {
    for selection in selections.iter_mut() {
        match selection {
            Selection::LinkedField(linked_field) => {
                if let Some((return_fragment, identity_field)) = linked_field
                    .selections
                    .items
                    .iter()
                    .find_map(|child| matched_placeholder(child, return_fragments))
                {
                    // Drop the placeholder spread and inject the shadowed
                    // field's identity selection (`<identity_field> __typename`)
                    // as its minimal selection.
                    linked_field
                        .selections
                        .items
                        .retain(|child| matched_placeholder(child, return_fragments).is_none());
                    inject_identity_selection(&mut linked_field.selections.items, identity_field);
                    linked_field
                        .directives
                        .push(shadow_return_directive(return_fragment));
                }
                convert_spreads_in_selections(&mut linked_field.selections.items, return_fragments);
            }
            Selection::InlineFragment(inline_fragment) => {
                convert_spreads_in_selections(
                    &mut inline_fragment.selections.items,
                    return_fragments,
                );
            }
            Selection::FragmentSpread(_) | Selection::ScalarField(_) => {}
        }
    }
}

/// If `selection` is a `@returnFragment` placeholder spread (its name is one of
/// the resolver's return fragments), return that return-fragment name together
/// with the identity field to inject for that resolver.
fn matched_placeholder(
    selection: &Selection,
    return_fragments: &FnvHashMap<FragmentDefinitionName, StringKey>,
) -> Option<(FragmentDefinitionName, StringKey)> {
    match selection {
        Selection::FragmentSpread(spread) => {
            let name = FragmentDefinitionName(spread.name.value);
            return_fragments
                .get(&name)
                .map(|identity_field| (name, *identity_field))
        }
        _ => None,
    }
}

/// Ensure the shadowed field's identity selection (`identity_field` and
/// `__typename`) is present in the selection set, adding any that are missing.
///
/// This runs at the syntax/AST rail (before `build_ir`), so it cannot consult the
/// resolver's lowered `output_type_info`. The caller classifies the resolver's
/// return type from the SCHEMA and passes the resulting identity field:
///
/// - Strong/`EdgeTo` and client-`@weak` arms: `id` (the `node_interface_id_field`).
///   The strong arm reads the returned DataID pointer; the client-weak arm reads
///   the model instance INLINE and the identity selection is just the resolver's
///   own input.
/// - Server-value read-in-place arm: `__id` (`schema.clientid_field()`),
///   the DataID/store key. A non-Node value type has no `id` field, so the edge
///   reads the transplanted `client:<parentid>:<field>` record off its `__id`.
///
/// Choosing the identity field is just selecting which store key the edge reads
/// off of — it is NOT re-deriving weak-ness — so doing it from the schema at this
/// AST rail is sound.
fn inject_identity_selection(selections: &mut Vec<Selection>, identity_field: StringKey) {
    for field_name in [identity_field, "__typename".intern()] {
        let already_present = selections.iter().any(|selection| {
            matches!(
                selection,
                Selection::ScalarField(field)
                    if field.name.value == field_name && field.alias.is_none()
            )
        });
        if !already_present {
            selections.push(Selection::ScalarField(generated_scalar_field(
                field_name.lookup(),
            )));
        }
    }
}

fn empty_token() -> Token {
    Token {
        span: Span::empty(),
        kind: TokenKind::Empty,
    }
}

fn generated_identifier(value: &str) -> Identifier {
    Identifier {
        span: Span::empty(),
        token: empty_token(),
        value: value.intern(),
    }
}

fn generated_scalar_field(name: &str) -> ScalarField {
    ScalarField {
        span: Span::empty(),
        alias: None,
        name: generated_identifier(name),
        arguments: None,
        directives: vec![],
    }
}

fn shadow_return_directive(return_fragment: FragmentDefinitionName) -> Directive {
    let argument = graphql_syntax::Argument {
        span: Span::empty(),
        name: Identifier {
            span: Span::empty(),
            token: empty_token(),
            value: SHADOW_RETURN_FRAGMENT_ARGUMENT_NAME.0,
        },
        colon: empty_token(),
        value: Value::Constant(ConstantValue::String(StringNode {
            token: empty_token(),
            value: return_fragment.0,
        })),
    };
    Directive {
        span: Span::empty(),
        at: empty_token(),
        name: Identifier {
            span: Span::empty(),
            token: empty_token(),
            value: SHADOW_RETURN_DIRECTIVE_NAME.0,
        },
        arguments: Some(List::generated(vec![argument])),
    }
}
