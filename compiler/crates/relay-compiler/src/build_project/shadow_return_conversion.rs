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
use fnv::FnvHashSet;
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
use intern::string_key::Intern;
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

/// Build a map from each shadow resolver's `@rootFragment` name to the set of
/// `@returnFragment` ("magic fragment") names whose placeholder spreads should be
/// converted within it. A shadow resolver is a resolver field that declares both
/// a root fragment and a return fragment.
///
/// The value is a set (not a single name) because two resolver fields may share
/// the same `@rootFragment` while declaring different `@returnFragment`s; keying
/// by a single value would silently drop one of them, leaving that resolver's
/// placeholder unconverted (and failing later with an undefined-fragment error).
fn shadow_return_fragments_by_root_fragment(
    schema: &SDLSchema,
) -> FnvHashMap<FragmentDefinitionName, FnvHashSet<FragmentDefinitionName>> {
    let mut by_root: FnvHashMap<FragmentDefinitionName, FnvHashSet<FragmentDefinitionName>> =
        FnvHashMap::default();
    for field in schema.fields() {
        if let Some(root_fragment) = get_resolver_fragment_dependency_name(field)
            && let Some(return_fragment) = get_resolver_return_fragment_name(field)
        {
            by_root
                .entry(root_fragment)
                .or_default()
                .insert(return_fragment);
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
pub(crate) fn convert_shadow_return_fragment_spreads(
    schema: &SDLSchema,
    definitions: &mut [ExecutableDefinition],
) {
    let return_fragments_by_root = shadow_return_fragments_by_root_fragment(schema);
    if return_fragments_by_root.is_empty() {
        return;
    }

    for definition in definitions.iter_mut() {
        if let ExecutableDefinition::Fragment(fragment) = definition
            && let Some(return_fragments) =
                return_fragments_by_root.get(&FragmentDefinitionName(fragment.name.value))
        {
            convert_spreads_in_selections(&mut fragment.selections.items, return_fragments);
        }
    }
}

/// Recursively walk a selection set looking for a linked field whose direct
/// child selections include a `@returnFragment` placeholder spread. When found,
/// replace the placeholder with the `@__relay_shadow_return` directive plus
/// `id __typename` on that linked field.
fn convert_spreads_in_selections(
    selections: &mut [Selection],
    return_fragments: &FnvHashSet<FragmentDefinitionName>,
) {
    for selection in selections.iter_mut() {
        match selection {
            Selection::LinkedField(linked_field) => {
                if let Some(return_fragment) = linked_field
                    .selections
                    .items
                    .iter()
                    .find_map(|child| matched_placeholder(child, return_fragments))
                {
                    // Drop the placeholder spread and inject the pointer
                    // selection (`id __typename`) as the field's minimal
                    // selection.
                    linked_field
                        .selections
                        .items
                        .retain(|child| matched_placeholder(child, return_fragments).is_none());
                    inject_pointer_selection(&mut linked_field.selections.items);
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
/// the resolver's return fragments), return that return-fragment name.
fn matched_placeholder(
    selection: &Selection,
    return_fragments: &FnvHashSet<FragmentDefinitionName>,
) -> Option<FragmentDefinitionName> {
    match selection {
        Selection::FragmentSpread(spread) => {
            let name = FragmentDefinitionName(spread.name.value);
            return_fragments.contains(&name).then_some(name)
        }
        _ => None,
    }
}

/// Ensure `id` and `__typename` scalar fields are present in the selection set,
/// adding any that are missing. These form the pointer (DataID) the shadow
/// resolver returns.
fn inject_pointer_selection(selections: &mut Vec<Selection>) {
    for field_name in ["id", "__typename"] {
        let interned = field_name.intern();
        let already_present = selections.iter().any(|selection| {
            matches!(
                selection,
                Selection::ScalarField(field)
                    if field.name.value == interned && field.alias.is_none()
            )
        });
        if !already_present {
            selections.push(Selection::ScalarField(generated_scalar_field(field_name)));
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
