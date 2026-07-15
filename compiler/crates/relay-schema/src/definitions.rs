/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::NamedItem;
use docblock_shared::RELAY_RESOLVER_MODEL_DIRECTIVE_NAME;
use docblock_shared::RELAY_RESOLVER_MODEL_INSTANCE_FIELD;
use docblock_shared::RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE;
use intern::Lookup;
use intern::string_key::StringKey;
use schema::FieldID;
use schema::ObjectID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

pub trait ResolverType {
    fn is_resolver_object<S: Schema>(&self, schema: &S) -> bool;
    fn is_weak_resolver_object<S: Schema>(&self, schema: &S) -> bool;
    fn is_terse_resolver_object<S: Schema>(&self, schema: &S) -> bool;
}

/// If `type_` is an `@weak` resolver model object, return its single
/// model-instance field (`__relay_model_instance`) — the field a reader uses to
/// read the weak value inline (no DataID pointer). Returns `None` for anything
/// that is not an `@weak` object.
///
/// This is the one place that resolves the weak object's instance field, shared
/// by `field_transform` (routing a weak return to the inline `Composite` arm)
/// and `client_edges` (per-implementor weak classification).
pub fn weak_object_instance_field<S: Schema>(schema: &S, type_: Type) -> Option<FieldID> {
    let Type::Object(object_id) = type_ else {
        return None;
    };
    let object = schema.object(object_id);
    object
        .directives
        .named(*RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE)?;
    // A weak object is expected to have exactly one field, the magic
    // `__relay_model_instance` field.
    object.fields.first().copied()
}

/// Returns `true` when `type_` is a non-Node SERVER VALUE object — a server
/// (non-extension) `Object` that does not implement `Node` (has no
/// `id_field_name` field) and is not an `@weak` model.
///
/// A server value type normalizes to `client:<parentid>:<field>` and has no
/// global id and no separate record to refetch. When such a type is the return
/// of a shadow (`@returnFragment`) resolver it must be read INLINE in place off
/// the transplanted record via its `__id` (the DataID/store key), rather than
/// routed to the strong `EdgeTo` pointer arm (which assumes an `id` field) or the
/// `@weak` model-instance arm.
///
/// This is the single place that classifies "server value type", shared by the
/// docblock schema validation (which must allow such a return past the
/// `@outputType`/weak check) and `field_transform` (which routes it to the
/// read-in-place inline arm). `id_field_name` is the project's
/// `node_interface_id_field` so the Node check honors a custom id field name.
pub fn is_server_value_object<S: Schema>(
    schema: &S,
    type_: Type,
    id_field_name: StringKey,
) -> bool {
    let Type::Object(object_id) = type_ else {
        return false;
    };
    // A client-extension object (e.g. a `@weak` model or any client type) is not
    // a server value type; those are handled by the weak / model arms.
    if schema.is_extension_type(type_) {
        return false;
    }
    let object = schema.object(object_id);
    // A Node / strong server object exposes an `id` field and is read via the
    // strong pointer arm; a value type has no `id`.
    let has_id_field = object
        .fields
        .iter()
        .any(|field_id| schema.field(*field_id).name.item == id_field_name);
    !has_id_field
}

/// Returns `true` when a resolver is a shadow (`@returnFragment`) resolver whose
/// return type is a non-Node SERVER VALUE object — i.e. the READ-IN-PLACE arm.
///
/// This is the SINGLE source of truth for the compound policy "the return is a
/// magic fragment AND the returned type is a server value type". The server-value
/// arm and the plain `@outputType` arm both collapse to the same
/// `ResolverOutputTypeInfo::Composite` metadata (no `weak_object_instance_field`),
/// so every site that must tell them apart — `field_transform` (route to the
/// inline `Composite` arm), `build_ast` (emit `ServerWeak` `normalizationInfo`
/// with no `normalizationNode`), `generate_relay_resolvers_operations_for_nested_objects`
/// (skip generating a normalization operation), and `relay-typegen`'s `visit`
/// (emit a `{__typename, __id}` identity return type instead of a dangling
/// `$normalization` import) — calls this one helper.
///
/// `has_return_fragment` is supplied by the caller because the magic-fragment
/// marker is reachable via different shapes at each site (resolver metadata vs.
/// the `@relayResolver`/`@returnFragment` directive argument). `id_field_name` is
/// the project's `node_interface_id_field`.
pub fn is_server_weak_shadow_return<S: Schema>(
    schema: &S,
    type_: Type,
    id_field_name: StringKey,
    has_return_fragment: bool,
) -> bool {
    has_return_fragment && is_server_value_object(schema, type_, id_field_name)
}

/// The concrete object implementors of an abstract (interface/union) `type_`.
/// Returns `None` for a non-abstract type. Uses `recursively_implementing_objects`
/// for interfaces (which lives on `SDLSchema`, hence this takes `&SDLSchema`
/// rather than the `Schema` trait bound used by the other helpers in this file).
fn abstract_type_implementors(schema: &SDLSchema, type_: Type) -> Option<Vec<ObjectID>> {
    match type_ {
        Type::Interface(interface_id) => Some(
            schema
                .interface(interface_id)
                .recursively_implementing_objects(schema)
                .into_iter()
                .collect(),
        ),
        Type::Union(union_id) => Some(schema.union(union_id).members.clone()),
        _ => None,
    }
}

/// Returns `true` when `type_` is an abstract (interface/union) shadow
/// (`@returnFragment`) return whose implementor set includes AT LEAST ONE
/// `@weak` model or non-Node server VALUE type — i.e. a member that must be read
/// INLINE (no DataID pointer, no `node(id:)` refetch) rather than via the strong
/// `EdgeTo` pointer arm.
///
/// This is the interface-level counterpart to the concrete-return
/// classifiers `weak_object_instance_field` and `is_server_weak_shadow_return`:
/// an interface has no object id, so weak/value-ness is per *implementor*,
/// not on the return type itself. `field_transform` calls this to route such a
/// return to the inline `Composite` arm (so `build_ast` emits the backing-field
/// `normalizationInfo` the runtime needs to take the inline branch rather than the
/// `storeID=id` server arm, which would invariant on a no-id weak record).
///
/// Strong Node implementors keep the pointer + `@waterfall` refetch arm; this
/// predicate only decides whether the inline arm is *reachable at all* for the
/// edge.
pub fn abstract_shadow_return_has_inline_implementor(
    schema: &SDLSchema,
    type_: Type,
    id_field_name: StringKey,
    has_return_fragment: bool,
) -> bool {
    if !has_return_fragment {
        return false;
    }
    let Some(members) = abstract_type_implementors(schema, type_) else {
        return false;
    };
    members.iter().any(|object_id| {
        let member = Type::Object(*object_id);
        weak_object_instance_field(schema, member).is_some()
            || is_server_value_object(schema, member, id_field_name)
    })
}

/// Returns `true` when `type_` is an abstract (interface/union) shadow
/// (`@returnFragment`) return with AT LEAST ONE server (non-extension) implementor
/// — a strong Node OR a non-Node server VALUE type.
///
/// Such a return cannot use the all-client "fat" `$normalization` operation: a
/// server implementor is not a client type, so
/// `generate_relay_resolvers_operations_for_nested_objects` would reject it. The
/// resolver returns the per-`__typename` identity (`{__typename, __id}`) instead.
/// The all-`@weak`/all-client-model abstract return (no server member) is NOT
/// covered here — it keeps generating its fat client normalization, which the
/// resolver returns and `LiveResolverCache` normalizes (the WeakModel arm).
///
/// `generate_relay_resolvers_operations_for_nested_objects` (skip the fat op) and
/// `relay-typegen`'s `visit` (emit the identity return type, not a dangling
/// `$normalization` import) consult this.
pub fn abstract_shadow_return_has_server_implementor(
    schema: &SDLSchema,
    type_: Type,
    id_field_name: StringKey,
    has_return_fragment: bool,
) -> bool {
    if !has_return_fragment {
        return false;
    }
    let Some(members) = abstract_type_implementors(schema, type_) else {
        return false;
    };
    members
        .iter()
        .any(|object_id| !schema.is_extension_type(Type::Object(*object_id)))
        && abstract_shadow_return_has_inline_implementor(
            schema,
            type_,
            id_field_name,
            has_return_fragment,
        )
}

/// The `normalizationInfo.kind` for an abstract (interface/union) shadow return
/// that has an inline implementor. Returns the WEAK kind when any implementor is
/// an `@weak` model, otherwise the VALUE (read-in-place) kind. The required
/// fixtures never mix `@weak` and server-value implementors in one return, so
/// a single kind suffices; weak takes precedence if both were ever present.
///
/// `None` means "no inline implementor" (the abstract return is all strong/Node
/// or all non-weak client models, handled by the existing pointer/model arms).
pub fn abstract_shadow_return_inline_kind(
    schema: &SDLSchema,
    type_: Type,
    id_field_name: StringKey,
) -> Option<AbstractInlineKind> {
    let members = abstract_type_implementors(schema, type_)?;
    let mut has_weak = false;
    let mut has_value = false;
    for object_id in &members {
        let member = Type::Object(*object_id);
        if weak_object_instance_field(schema, member).is_some() {
            has_weak = true;
        } else if is_server_value_object(schema, member, id_field_name) {
            has_value = true;
        }
    }
    if has_weak {
        Some(AbstractInlineKind::WeakModel)
    } else if has_value {
        Some(AbstractInlineKind::ServerWeak)
    } else {
        None
    }
}

/// The PER-`__typename` inline `normalizationInfo.kind` for an abstract
/// (interface/union) shadow return with inline implementors. Unlike
/// `abstract_shadow_return_inline_kind` (which COLLAPSES to a single kind with
/// weak precedence), this returns each inline implementor's OWN kind —
/// `WeakModel` for an `@weak` model, `ServerWeak` for a non-Node server value
/// type — so an interface with weak and/or value members can dispatch per
/// concrete `__typename` at runtime via the emitted `inlineKinds` map. Returns
/// `None` when there is no inline implementor. Strong Node implementors are
/// omitted (they are gated out of mixed inline returns by
/// `MagicFragmentMixedInlineAndRefetchableUnsupported`). The result is sorted by
/// type name for deterministic codegen.
pub fn abstract_shadow_return_inline_kinds_by_typename(
    schema: &SDLSchema,
    type_: Type,
    id_field_name: StringKey,
) -> Option<Vec<(StringKey, AbstractInlineKind)>> {
    let members = abstract_type_implementors(schema, type_)?;
    let mut kinds: Vec<(StringKey, AbstractInlineKind)> = Vec::new();
    for object_id in &members {
        let member = Type::Object(*object_id);
        let kind = if weak_object_instance_field(schema, member).is_some() {
            AbstractInlineKind::WeakModel
        } else if is_server_value_object(schema, member, id_field_name) {
            AbstractInlineKind::ServerWeak
        } else {
            continue;
        };
        kinds.push((schema.get_type_name(member), kind));
    }
    if kinds.is_empty() {
        return None;
    }
    kinds.sort_by(|a, b| a.0.lookup().cmp(b.0.lookup()));
    Some(kinds)
}

/// Returns `true` when an abstract shadow return mixes BOTH an `@weak` model
/// implementor AND a non-Node server value implementor — the case whose resolver
/// return type is a per-`__typename` discriminated union (`relay-typegen`) and
/// whose backing field carries a mixed `inlineKinds` map.
pub fn abstract_shadow_return_is_mixed_inline(
    schema: &SDLSchema,
    type_: Type,
    id_field_name: StringKey,
) -> bool {
    let Some(kinds) = abstract_shadow_return_inline_kinds_by_typename(schema, type_, id_field_name)
    else {
        return false;
    };
    kinds
        .iter()
        .any(|(_, k)| *k == AbstractInlineKind::WeakModel)
        && kinds
            .iter()
            .any(|(_, k)| *k == AbstractInlineKind::ServerWeak)
}

/// Which inline `normalizationInfo.kind` a mixed/abstract shadow return's backing
/// field carries. The reader takes the same no-`ensureClientRecord`/no-refetch
/// inline branch for both; the kind only drives the dev-only read-in-place
/// provenance assert.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AbstractInlineKind {
    WeakModel,
    ServerWeak,
}

impl ResolverType for Type {
    fn is_resolver_object<S: Schema>(&self, schema: &S) -> bool {
        if let Type::Object(object_id) = self {
            let object = schema.object(*object_id);
            object
                .directives
                .named(*RELAY_RESOLVER_MODEL_DIRECTIVE_NAME)
                .is_some()
        } else {
            false
        }
    }

    fn is_weak_resolver_object<S: Schema>(&self, schema: &S) -> bool {
        weak_object_instance_field(schema, *self).is_some()
    }

    fn is_terse_resolver_object<S: Schema>(&self, schema: &S) -> bool {
        if let Type::Object(object_id) = self {
            let object = schema.object(*object_id);
            object.fields.iter().any(|field_id| {
                schema.field(*field_id).name.item == *RELAY_RESOLVER_MODEL_INSTANCE_FIELD
            })
        } else {
            false
        }
    }
}
