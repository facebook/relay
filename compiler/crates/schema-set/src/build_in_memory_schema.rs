/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Builds an [`InMemorySchema`] directly from a [`SchemaSet`].
//!
//! The point of this conversion — versus printing the `SchemaSet` to SDL and
//! re-parsing it through `schema::build_schema` — is to **preserve the original
//! source locations**. A `SchemaSet` already records, on every definition item,
//! the `Location`s it was built from (see [`SchemaDefinitionItem`]). Round-tripping
//! through printed SDL throws those away (every span becomes `Location::generated()`);
//! building the schema structures directly carries them into each `WithLocation`,
//! so any schema/validation problem can be pointed back at the original source
//! lines.
//!
//! Note: this assumes a *complete* schema set (every referenced type is present).
//! A referenced-but-missing (or mis-kinded) type is reported as an error rather
//! than synthesized, and that error points at the referencing site's original
//! source location — so even the failure mode keeps source fidelity.

use std::collections::BTreeMap;
use std::collections::HashMap;

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::Location;
use common::Span;
use common::WithLocation;
use graphql_syntax::ConstantValue;
use graphql_syntax::IntNode;
use graphql_syntax::List;
use graphql_syntax::Token;
use graphql_syntax::TokenKind;
use intern::string_key::StringKey;
use intern::string_key::StringKeyIndexMap;
use intern::string_key::StringKeyMap;
use schema::Argument;
use schema::ArgumentDefinitions;
use schema::ArgumentValue;
use schema::Directive;
use schema::DirectiveValue;
use schema::Enum;
use schema::EnumID;
use schema::EnumValue;
use schema::Field;
use schema::FieldID;
use schema::InMemorySchema;
use schema::InputObject;
use schema::InputObjectID;
use schema::Interface;
use schema::InterfaceID;
use schema::Object;
use schema::ObjectID;
use schema::SDLSchema;
use schema::Scalar;
use schema::ScalarID;
use schema::Type;
use schema::TypeReference;
use schema::Union;
use schema::UnionID;

use crate::SEMANTIC_NON_NULL;
use crate::SEMANTIC_NON_NULL_LEVELS_ARG;
use crate::builtin_scalars::BUILTIN_SCALAR_SET;
use crate::print_schema_set::print_set_directive_value;
use crate::schema_set::HasCoordinate;
use crate::schema_set::HasDefinitionItem;
use crate::schema_set::SchemaDefinitionItem;
use crate::schema_set::SchemaSet;
use crate::schema_set::SetArgument;
use crate::schema_set::SetDirectiveValue;
use crate::schema_set::SetField;
use crate::schema_set::SetMemberType;
use crate::schema_set::SetType;
use crate::schema_set::StringKeyNamed;
use crate::set_type_reference::OutputNonNull;
use crate::set_type_reference::OutputTypeReference;

/// Build an [`InMemorySchema`] from this [`SchemaSet`], preserving the original
/// source [`Location`]s recorded on the set.
pub fn build_in_memory_schema(schema_set: &SchemaSet) -> DiagnosticsResult<InMemorySchema> {
    validate_no_extension_only_types(schema_set)?;

    // ---- Pass 1: assign type ids and build the name -> Type map. ----
    // A BTreeMap gives stable key-ordered iteration (and `StringKey` is `Copy`,
    // so no `&StringKey`s leak out), which makes id assignment deterministic. The
    // schema only depends on a consistent name -> id mapping, not a particular
    // ordering.
    let mut sorted_types: BTreeMap<StringKey, &SetType> = schema_set
        .types
        .iter()
        .map(|(name, set_type)| (*name, set_type))
        .collect();

    // The GraphQL built-in scalars (Int/Float/String/Boolean/ID) are implicit:
    // the spec expects them not to be declared, but the Relay compiler sometimes
    // expects them to be explicitly present, so support both forms.
    for (name, set_type) in BUILTIN_SCALAR_SET.types.iter() {
        sorted_types.entry(*name).or_insert(set_type);
    }

    let mut type_map: HashMap<StringKey, Type> = HashMap::with_capacity(sorted_types.len());
    let mut object_refs = Vec::new();
    let mut interface_refs = Vec::new();
    let mut union_refs = Vec::new();
    let mut enum_refs = Vec::new();
    let mut scalar_refs = Vec::new();
    let mut input_object_refs = Vec::new();

    for (name, set_type) in sorted_types {
        match set_type {
            SetType::Object(o) => {
                type_map.insert(name, Type::Object(ObjectID(object_refs.len() as u32)));
                object_refs.push(o);
            }
            SetType::Interface(i) => {
                type_map.insert(
                    name,
                    Type::Interface(InterfaceID(interface_refs.len() as u32)),
                );
                interface_refs.push(i);
            }
            SetType::Union(u) => {
                type_map.insert(name, Type::Union(UnionID(union_refs.len() as u32)));
                union_refs.push(u);
            }
            SetType::Enum(e) => {
                type_map.insert(name, Type::Enum(EnumID(enum_refs.len() as u32)));
                enum_refs.push(e);
            }
            SetType::Scalar(s) => {
                type_map.insert(name, Type::Scalar(ScalarID(scalar_refs.len() as u32)));
                scalar_refs.push(s);
            }
            SetType::InputObject(io) => {
                type_map.insert(
                    name,
                    Type::InputObject(InputObjectID(input_object_refs.len() as u32)),
                );
                input_object_refs.push(io);
            }
        }
    }

    // ---- Pass 2: build the actual schema structures. ----
    // Field structs live in one flat arena (`fields`); objects and interfaces
    // reference them by `FieldID`. The object/interface builders push into this
    // arena as they go, so they read `idx` for their own id and thread `&mut
    // fields` through `build_fields`.
    let mut fields: Vec<Field> = Vec::new();

    let objects: Vec<Object> = object_refs
        .iter()
        .enumerate()
        .map(|(idx, o)| {
            let object_location = first_location(&o.definition);
            Ok(Object {
                name: WithLocation::new(object_location, o.name),
                is_extension: o.definition.is_client_definition,
                fields: build_fields(
                    &o.fields,
                    Type::Object(ObjectID(idx as u32)),
                    &mut fields,
                    &type_map,
                )?,
                interfaces: resolve_interface_ids(&o.interfaces, &type_map)?,
                directives: build_directive_values(&o.directives),
                description: o.definition.description,
                hack_source: o.definition.hack_source,
            })
        })
        .collect::<DiagnosticsResult<_>>()?;

    let mut interfaces: Vec<Interface> = interface_refs
        .iter()
        .enumerate()
        .map(|(idx, i)| {
            let interface_location = first_location(&i.definition);
            Ok(Interface {
                name: WithLocation::new(interface_location, i.name),
                is_extension: i.definition.is_client_definition,
                // Populated in the reverse pass below.
                implementing_interfaces: Vec::new(),
                implementing_objects: Vec::new(),
                fields: build_fields(
                    &i.fields,
                    Type::Interface(InterfaceID(idx as u32)),
                    &mut fields,
                    &type_map,
                )?,
                directives: build_directive_values(&i.directives),
                interfaces: resolve_interface_ids(&i.interfaces, &type_map)?,
                description: i.definition.description,
                hack_source: i.definition.hack_source,
            })
        })
        .collect::<DiagnosticsResult<_>>()?;

    // Reverse-populate `implementing_objects` / `implementing_interfaces`.
    for (idx, object) in objects.iter().enumerate() {
        for interface_id in &object.interfaces {
            interfaces[interface_id.0 as usize]
                .implementing_objects
                .push(ObjectID(idx as u32));
        }
    }
    let interface_parents: Vec<(u32, Vec<InterfaceID>)> = interfaces
        .iter()
        .enumerate()
        .map(|(idx, i)| (idx as u32, i.interfaces.clone()))
        .collect();
    for (child_idx, parents) in interface_parents {
        for parent_id in parents {
            interfaces[parent_id.0 as usize]
                .implementing_interfaces
                .push(InterfaceID(child_idx));
        }
    }

    let unions: Vec<Union> = union_refs
        .iter()
        .map(|u| {
            let mut members: Vec<_> = u.members.values().collect();
            members.sort_by_key(|member| member.name);
            Ok(Union {
                name: WithLocation::new(first_location(&u.definition), u.name),
                is_extension: u.definition.is_client_definition,
                members: members
                    .into_iter()
                    .map(|member| {
                        resolve_object_id(
                            member.name,
                            first_location(&member.definition),
                            &type_map,
                        )
                    })
                    .collect::<DiagnosticsResult<_>>()?,
                directives: build_directive_values(&u.directives),
                description: u.definition.description,
                hack_source: u.definition.hack_source,
            })
        })
        .collect::<DiagnosticsResult<_>>()?;

    let enums: Vec<Enum> = enum_refs
        .iter()
        .map(|e| Enum {
            name: WithLocation::new(first_location(&e.definition), e.name),
            is_extension: e.definition.is_client_definition,
            values: e
                .values
                .values()
                .map(|value| EnumValue {
                    value: value.value,
                    directives: build_directive_values(&value.directives),
                    description: value.description,
                })
                .collect(),
            directives: build_directive_values(&e.directives),
            description: e.definition.description,
            hack_source: e.definition.hack_source,
        })
        .collect();

    let scalars: Vec<Scalar> = scalar_refs
        .iter()
        .map(|s| Scalar {
            name: WithLocation::new(first_location(&s.definition), s.name),
            is_extension: s.definition.is_client_definition,
            directives: build_directive_values(&s.directives),
            description: s.definition.description,
            hack_source: s.definition.hack_source,
        })
        .collect();

    let input_objects: Vec<InputObject> = input_object_refs
        .iter()
        .map(|io| {
            Ok(InputObject {
                name: WithLocation::new(first_location(&io.definition), io.name),
                fields: build_arguments(&io.fields, &type_map)?,
                directives: build_directive_values(&io.directives),
                description: io.definition.description,
                hack_source: io.definition.hack_source,
            })
        })
        .collect::<DiagnosticsResult<_>>()?;

    let directives: HashMap<DirectiveName, Directive> = schema_set
        .directives
        .values()
        .map(|directive| {
            Ok((
                directive.name,
                Directive {
                    name: WithLocation::new(first_location(&directive.definition), directive.name),
                    arguments: build_arguments(&directive.arguments, &type_map)?,
                    locations: directive.locations.clone(),
                    repeatable: directive.repeatable,
                    is_extension: directive.definition.is_client_definition,
                    directives: build_directive_values(&directive.directives),
                    description: directive.definition.description,
                    hack_source: directive.definition.hack_source,
                },
            ))
        })
        .collect::<DiagnosticsResult<_>>()?;

    let root_location = first_location(&schema_set.root_schema.definition);
    let query_type =
        resolve_root_type(schema_set.root_schema.query_type, root_location, &type_map)?;
    let mutation_type = resolve_root_type(
        schema_set.root_schema.mutation_type,
        root_location,
        &type_map,
    )?;
    let subscription_type = resolve_root_type(
        schema_set.root_schema.subscription_type,
        root_location,
        &type_map,
    )?;

    Ok(InMemorySchema::from_raw_parts(
        query_type,
        mutation_type,
        subscription_type,
        type_map,
        directives,
        enums,
        fields,
        input_objects,
        interfaces,
        objects,
        scalars,
        unions,
    ))
}

/// Convenience wrapper returning an [`SDLSchema`] (the enum most schema
/// consumers accept) backed by the in-memory schema built from `schema_set`.
pub fn build_sdl_schema(schema_set: &SchemaSet) -> DiagnosticsResult<SDLSchema> {
    Ok(SDLSchema::InMemory(build_in_memory_schema(schema_set)?))
}

fn first_location(item: &SchemaDefinitionItem) -> Location {
    item.locations
        .first()
        .copied()
        .unwrap_or_else(Location::generated)
}

fn validate_no_extension_only_types(schema_set: &SchemaSet) -> DiagnosticsResult<()> {
    let diagnostics = schema_set
        .types
        .values()
        .filter(|set_type| set_type.coordinate().is_none())
        .map(|set_type| {
            Diagnostic::error(
                format!(
                    "Cannot build schema because type `{}` only has extension definitions",
                    set_type.string_key_name()
                ),
                first_location(set_type.definition_item()),
            )
        })
        .collect::<Vec<_>>();
    if diagnostics.is_empty() {
        Ok(())
    } else {
        Err(diagnostics)
    }
}

fn build_fields(
    set_fields: &StringKeyMap<SetField>,
    parent: Type,
    fields: &mut Vec<Field>,
    type_map: &HashMap<StringKey, Type>,
) -> DiagnosticsResult<Vec<FieldID>> {
    let mut sorted: Vec<&SetField> = set_fields.values().collect();
    sorted.sort_by_key(|field| field.name.0);

    sorted
        .into_iter()
        .map(|set_field| {
            let field = build_field(set_field, parent, type_map)?;
            let id = FieldID(fields.len() as u32);
            fields.push(field);
            Ok(id)
        })
        .collect()
}

fn build_field(
    set_field: &SetField,
    parent: Type,
    type_map: &HashMap<StringKey, Type>,
) -> DiagnosticsResult<Field> {
    let field_location = first_location(&set_field.definition);
    let (type_, mut semantic_levels) =
        resolve_output_type(&set_field.type_, 0, field_location, type_map)?;
    let mut directives = build_directive_values(&set_field.directives);
    if !semantic_levels.is_empty() {
        semantic_levels.reverse();
        directives.push(semantic_non_null_directive(semantic_levels));
    }
    Ok(Field {
        name: WithLocation::new(field_location, set_field.name.0),
        is_extension: set_field.definition.is_client_definition,
        arguments: build_arguments(&set_field.arguments, type_map)?,
        type_,
        directives,
        parent_type: Some(parent),
        description: set_field.definition.description,
        hack_source: set_field.definition.hack_source,
    })
}

fn build_arguments(
    set_arguments: &StringKeyIndexMap<SetArgument>,
    type_map: &HashMap<StringKey, Type>,
) -> DiagnosticsResult<ArgumentDefinitions> {
    // Arguments are stored in insertion order (which depends on input read
    // order); sort by name so the built schema is deterministic and matches the
    // alphabetical ordering the used-schema printer emits.
    //
    // NOTE: we probably want to update this to preserve original order, but to do that
    // we would need to have a more deterministic merge-to-ordering.
    let mut sorted: Vec<&SetArgument> = set_arguments.values().collect();
    sorted.sort_by_key(|argument| argument.name);

    let arguments = sorted
        .into_iter()
        .map(|set_argument| {
            let argument_location = first_location(&set_argument.definition);
            Ok(Argument {
                name: WithLocation::new(argument_location, ArgumentName(set_argument.name)),
                type_: resolve_input_type(&set_argument.type_, argument_location, type_map)?,
                default_value: set_argument.default_value.clone(),
                description: set_argument.definition.description,
                directives: build_directive_values(&set_argument.directives),
            })
        })
        .collect::<DiagnosticsResult<_>>()?;
    Ok(ArgumentDefinitions::new(arguments))
}

fn build_directive_values(set_directives: &[SetDirectiveValue]) -> Vec<DirectiveValue> {
    // Applied directives (and their argument values) are stored in input order,
    // which depends on input read order. Sort them the same way the used-schema
    // printer does — directives by their rendered `@name(args)` form, argument
    // values by name — so the built schema is deterministic and byte-for-byte
    // matches the printed ordering.
    //
    // NOTE this is *mildly* breaking with the spec, but our merging is as well so it's not the worst.
    let mut sorted: Vec<&SetDirectiveValue> = set_directives.iter().collect();
    sorted.sort_by_cached_key(|directive| print_set_directive_value(directive));

    sorted
        .into_iter()
        .map(|set_directive| {
            let mut directive_value = set_directive.to_directive_value();
            directive_value
                .arguments
                .sort_by_key(|argument| argument.name.0);
            directive_value
        })
        .collect()
}

/// Resolve a name-keyed input type reference (argument/input-field type) into a
/// schema-id-keyed [`TypeReference`]. `location` is the referencing site, used to
/// point a missing-type error back at the original source.
fn resolve_input_type(
    type_ref: &TypeReference<StringKey>,
    location: Location,
    type_map: &HashMap<StringKey, Type>,
) -> DiagnosticsResult<TypeReference<Type>> {
    Ok(match type_ref {
        TypeReference::Named(name) => {
            TypeReference::Named(resolve_input_named(*name, location, type_map)?)
        }
        TypeReference::NonNull(inner) => {
            TypeReference::NonNull(Box::new(resolve_input_type(inner, location, type_map)?))
        }
        TypeReference::List(inner) => {
            TypeReference::List(Box::new(resolve_input_type(inner, location, type_map)?))
        }
    })
}

/// Resolve a name-keyed output type reference into a schema-id-keyed
/// [`TypeReference`], returning the (reversed) list of list-nesting levels that
/// were `@semanticNonNull` so the caller can re-attach the directive. `location`
/// is the referencing site, used to point a missing-type error back at the
/// original source.
fn resolve_output_type(
    type_ref: &OutputTypeReference<StringKey>,
    level: i64,
    location: Location,
    type_map: &HashMap<StringKey, Type>,
) -> DiagnosticsResult<(TypeReference<Type>, Vec<i64>)> {
    Ok(match type_ref {
        OutputTypeReference::Named(name) => (
            TypeReference::Named(resolve_output_named(*name, location, type_map)?),
            Vec::new(),
        ),
        OutputTypeReference::NonNull(OutputNonNull::KillsParent(inner)) => {
            let (inner_type, levels) = resolve_output_type(inner, level, location, type_map)?;
            (TypeReference::NonNull(Box::new(inner_type)), levels)
        }
        OutputTypeReference::NonNull(OutputNonNull::Semantic(inner)) => {
            // Semantic non-null is represented in the schema as a *nullable*
            // type plus a `@semanticNonNull` directive on the field.
            let (inner_type, mut levels) = resolve_output_type(inner, level, location, type_map)?;
            levels.push(level);
            (inner_type, levels)
        }
        OutputTypeReference::List(inner) => {
            let (inner_type, levels) = resolve_output_type(inner, level + 1, location, type_map)?;
            (TypeReference::List(Box::new(inner_type)), levels)
        }
    })
}

fn semantic_non_null_directive(levels: Vec<i64>) -> DirectiveValue {
    // Mirror the SDL builder (`output_type_ref_to_semantic_sdl_type`): emit the
    // bare `@semanticNonNull` when the only marked level is the outermost (0),
    // otherwise the explicit `levels: [...]` form. `levels` is unique and sorted
    // ascending here, so `last() == Some(0)` holds exactly when `levels == [0]`.
    let arguments = if let Some(0) = levels.last() {
        Vec::new()
    } else {
        let items = levels
            .into_iter()
            .map(|level| {
                ConstantValue::Int(IntNode {
                    token: generated_token(TokenKind::IntegerLiteral),
                    value: level,
                })
            })
            .collect();
        vec![ArgumentValue {
            name: *SEMANTIC_NON_NULL_LEVELS_ARG,
            value: ConstantValue::List(List {
                span: Span::empty(),
                start: generated_token(TokenKind::OpenBracket),
                items,
                end: generated_token(TokenKind::CloseBracket),
            }),
        }]
    };
    DirectiveValue {
        name: *SEMANTIC_NON_NULL,
        arguments,
    }
}

fn generated_token(kind: TokenKind) -> Token {
    Token {
        span: Span::empty(),
        kind,
    }
}

fn resolve_input_named(
    name: StringKey,
    location: Location,
    type_map: &HashMap<StringKey, Type>,
) -> DiagnosticsResult<Type> {
    match type_map.get(&name) {
        Some(type_ @ (Type::Scalar(_) | Type::Enum(_) | Type::InputObject(_))) => Ok(*type_),
        Some(_) => Err(vec![Diagnostic::error(
            format!(
                "Input type `{name}` must be a scalar, enum, or input object type in the schema set"
            ),
            location,
        )]),
        None => Err(vec![missing_type_diagnostic(name, location)]),
    }
}

fn resolve_output_named(
    name: StringKey,
    location: Location,
    type_map: &HashMap<StringKey, Type>,
) -> DiagnosticsResult<Type> {
    match type_map.get(&name) {
        Some(
            type_ @ (Type::Object(_)
            | Type::Interface(_)
            | Type::Union(_)
            | Type::Enum(_)
            | Type::Scalar(_)),
        ) => Ok(*type_),
        Some(_) => Err(vec![Diagnostic::error(
            format!(
                "Output type `{name}` must be an object, interface, union, enum, or scalar type in the schema set"
            ),
            location,
        )]),
        None => Err(vec![missing_type_diagnostic(name, location)]),
    }
}

fn missing_type_diagnostic(name: StringKey, location: Location) -> Diagnostic {
    Diagnostic::error(
        format!("Type `{name}` is referenced but not defined in the schema set"),
        location,
    )
}

fn resolve_object_id(
    name: StringKey,
    location: Location,
    type_map: &HashMap<StringKey, Type>,
) -> DiagnosticsResult<ObjectID> {
    match type_map.get(&name) {
        Some(Type::Object(id)) => Ok(*id),
        Some(_) => Err(vec![Diagnostic::error(
            format!("Union member `{name}` is not an object type in the schema set"),
            location,
        )]),
        None => Err(vec![missing_type_diagnostic(name, location)]),
    }
}

fn resolve_interface_ids(
    members: &StringKeyIndexMap<SetMemberType>,
    type_map: &HashMap<StringKey, Type>,
) -> DiagnosticsResult<Vec<InterfaceID>> {
    // `interfaces` is stored in insertion order (which depends on input read
    // order); sort by name so the implemented-interface list is deterministic
    // and matches the alphabetical ordering the used-schema printer emits.
    let mut sorted: Vec<&SetMemberType> = members.values().collect();
    sorted.sort_by_key(|member| member.name);

    sorted
        .into_iter()
        .map(|member| match type_map.get(&member.name) {
            Some(Type::Interface(id)) => Ok(*id),
            Some(_) => Err(vec![Diagnostic::error(
                format!(
                    "Implemented interface `{}` is not an interface type in the schema set",
                    member.name
                ),
                first_location(&member.definition),
            )]),
            None => Err(vec![missing_type_diagnostic(
                member.name,
                first_location(&member.definition),
            )]),
        })
        .collect()
}

fn resolve_root_type(
    name: Option<StringKey>,
    location: Location,
    type_map: &HashMap<StringKey, Type>,
) -> DiagnosticsResult<Option<ObjectID>> {
    // An absent root operation type is legitimate (`load_defaults` supplies the
    // conventional `Query`/`Mutation`/`Subscription` types when present). But a
    // root type that *is* declared yet missing or non-object is a real error —
    // swallowing it would resurface downstream as a confusing "no Query type".
    match name {
        None => Ok(None),
        Some(name) => match type_map.get(&name) {
            Some(Type::Object(id)) => Ok(Some(*id)),
            Some(_) => Err(vec![Diagnostic::error(
                format!("Root operation type `{name}` must be an object type in the schema set"),
                location,
            )]),
            None => Err(vec![Diagnostic::error(
                format!(
                    "Root operation type `{name}` is referenced but not defined in the schema set"
                ),
                location,
            )]),
        },
    }
}

#[cfg(test)]
mod tests {
    use common::DiagnosticsResult;
    use common::Location;
    use common::SourceLocationKey;
    use common::Span;
    use graphql_syntax::parse_schema_document;
    use intern::string_key::Intern;
    use schema::Schema;

    use super::build_in_memory_schema;
    use super::build_sdl_schema;
    use crate::schema_set::SchemaSet;

    fn schema_set_from(sdl: &str, source: SourceLocationKey) -> SchemaSet {
        SchemaSet::from_base_schema_documents(&[parse_schema_document(sdl, source).unwrap()])
            .unwrap()
    }

    fn schema_set_from_two_sources(
        first_sdl: &str,
        first_source: SourceLocationKey,
        second_sdl: &str,
        second_source: SourceLocationKey,
    ) -> SchemaSet {
        SchemaSet::from_base_schema_documents(&[
            parse_schema_document(first_sdl, first_source).unwrap(),
            parse_schema_document(second_sdl, second_source).unwrap(),
        ])
        .unwrap()
    }

    fn expect_build_error(sdl: &str, expected_message: &str) {
        let source = SourceLocationKey::standalone("bad.graphql");
        let result = build_in_memory_schema(&schema_set_from(sdl, source));

        let diagnostics = result.expect_err("schema set should fail to build");
        assert_eq!(diagnostics[0].message().to_string(), expected_message);
        assert_eq!(diagnostics[0].location().source_location(), source);
    }

    fn schema_set_from_base_and_extensions(
        base_sdl: &str,
        base_source: SourceLocationKey,
        extension_sdl: &str,
        extension_source: SourceLocationKey,
    ) -> DiagnosticsResult<SchemaSet> {
        SchemaSet::from_schema_documents_with_extensions(
            &[parse_schema_document(base_sdl, base_source).unwrap()],
            &[parse_schema_document(extension_sdl, extension_source).unwrap()],
        )
    }

    #[test]
    fn preserves_source_locations() {
        let sdl = "type Query { me: User }\n\ntype User { id: ID name: String }";
        let source = SourceLocationKey::standalone("user.graphql");
        let schema = build_in_memory_schema(&schema_set_from(sdl, source)).unwrap();

        // The `User` type's name points back at the original source file, not a
        // generated location — this is the whole purpose of the direct build.
        let user_type = schema.get_type("User".intern()).expect("User type exists");
        let user = schema.object(user_type.get_object_id().expect("User is an object"));
        assert_eq!(user.name.location.source_location(), source);
        assert_ne!(user.name.location, Location::generated());

        // Field locations are preserved too.
        let id_field_id = schema
            .named_field(user_type, "id".intern())
            .expect("User.id exists");
        let id_field = schema.field(id_field_id);
        assert_eq!(id_field.name.location.source_location(), source);
        assert_ne!(id_field.name.location, Location::generated());

        // Sanity: the schema is structurally usable (root + resolved field type).
        assert!(schema.query_type().is_some());
        assert!(matches!(id_field.type_, schema::TypeReference::Named(_)));
    }

    #[test]
    fn resolves_builtin_scalars_and_defaults() {
        let sdl = "type Query { name: String }";
        let source = SourceLocationKey::standalone("q.graphql");
        let schema = build_in_memory_schema(&schema_set_from(sdl, source)).unwrap();

        // `String` is implicit in the SDL but must exist in the built schema.
        assert!(schema.get_type("String".intern()).is_some());
        // `load_defaults` ran: __typename is queryable.
        let query = schema.query_type().unwrap();
        assert!(schema.named_field(query, "__typename".intern()).is_some());
    }

    #[test]
    fn round_trips_semantic_non_null() {
        let sdl = "type Query { name: String @semanticNonNull }";
        let source = SourceLocationKey::standalone("s.graphql");
        let schema = build_in_memory_schema(&schema_set_from(sdl, source)).unwrap();

        let query = schema.query_type().unwrap();
        let field = schema.field(schema.named_field(query, "name".intern()).unwrap());
        // `@semanticNonNull` is stored as a *nullable* type plus the directive...
        assert!(!field.type_.is_non_null());
        // ...and `semantic_type()` reconstructs the non-null form.
        assert!(field.semantic_type().is_non_null());
    }

    #[test]
    fn sorts_arguments_interfaces_and_directives_alphabetically() {
        // Arguments, implemented interfaces, and applied directives are declared
        // here in non-alphabetical order. The built schema must return them
        // alphabetically so its ordering is independent of input read order (a
        // flatbuffer schema is always fully sorted, and callsites moving off it
        // must not see ordering churn).
        let sdl = "\
directive @zed on OBJECT | FIELD_DEFINITION
directive @abc on OBJECT | FIELD_DEFINITION
interface Zeta { id: ID }
interface Alpha { id: ID }
interface Mango { id: ID }
type Node implements Zeta & Alpha & Mango @zed @abc {
  id: ID
  search(zebra: Int, alpha: Int, mango: Int): String @zed @abc
}
type Query { node: Node }";
        let source = SourceLocationKey::standalone("app.graphql");
        let schema = build_in_memory_schema(&schema_set_from(sdl, source)).unwrap();

        let node_type = schema.get_type("Node".intern()).expect("Node exists");
        let node = schema.object(node_type.get_object_id().expect("Node is an object"));

        // Implemented interfaces resolve in alphabetical name order.
        let interface_names: Vec<String> = node
            .interfaces
            .iter()
            .map(|id| schema.interface(*id).name.item.to_string())
            .collect();
        assert_eq!(interface_names, vec!["Alpha", "Mango", "Zeta"]);

        // Directives applied to the type are sorted by name.
        let type_directives: Vec<String> =
            node.directives.iter().map(|d| d.name.to_string()).collect();
        assert_eq!(type_directives, vec!["abc", "zed"]);

        let search = schema.field(
            schema
                .named_field(node_type, "search".intern())
                .expect("Node.search exists"),
        );

        // Field arguments are sorted by name.
        let argument_names: Vec<String> = search
            .arguments
            .iter()
            .map(|arg| arg.name.item.to_string())
            .collect();
        assert_eq!(argument_names, vec!["alpha", "mango", "zebra"]);

        // Directives applied to the field are sorted by name too.
        let field_directives: Vec<String> = search
            .directives
            .iter()
            .map(|d| d.name.to_string())
            .collect();
        assert_eq!(field_directives, vec!["abc", "zed"]);
    }

    #[test]
    fn builds_interfaces_unions_enums_and_inputs() {
        let sdl = "\
interface Node { id: ID! }
type User implements Node { id: ID! role: Role }
type Admin implements Node { id: ID! }
union Account = User | Admin
enum Role { ADMIN MEMBER }
input Filter { role: Role }
type Query { account(filter: Filter): Account }";
        let source = SourceLocationKey::standalone("app.graphql");
        let schema = build_in_memory_schema(&schema_set_from(sdl, source)).unwrap();

        // Interface implementing-objects are reverse-populated, and the
        // interface name keeps its original location.
        let node = schema
            .get_type("Node".intern())
            .unwrap()
            .get_interface_id()
            .unwrap();
        let user = schema
            .get_type("User".intern())
            .unwrap()
            .get_object_id()
            .unwrap();
        let admin = schema
            .get_type("Admin".intern())
            .unwrap()
            .get_object_id()
            .unwrap();
        let node_iface = schema.interface(node);
        assert!(node_iface.implementing_objects.contains(&user));
        assert!(node_iface.implementing_objects.contains(&admin));
        assert_eq!(node_iface.name.location.source_location(), source);

        // Union members resolve to the member object ids.
        let account = schema
            .get_type("Account".intern())
            .unwrap()
            .get_union_id()
            .unwrap();
        let members = &schema.union(account).members;
        assert!(members.contains(&user) && members.contains(&admin));

        // Enum values carry through.
        let role = schema
            .get_type("Role".intern())
            .unwrap()
            .get_enum_id()
            .unwrap();
        let values: Vec<_> = schema.enum_(role).values.iter().map(|v| v.value).collect();
        assert!(values.contains(&"ADMIN".intern()) && values.contains(&"MEMBER".intern()));

        // Input object fields resolve their (input) argument types.
        let filter = schema
            .get_type("Filter".intern())
            .unwrap()
            .get_input_object_id()
            .unwrap();
        assert!(schema.input_object(filter).fields.contains("role".intern()));
    }

    #[test]
    fn errors_on_missing_root_type() {
        // A declared-but-undefined root operation type is a real error, and the
        // diagnostic must carry the original source location rather than a
        // generated one — that source fidelity is the point of this module.
        let sdl = "schema { query: Missing }\n\ntype Other { id: ID }";
        let source = SourceLocationKey::standalone("bad.graphql");
        let result = build_in_memory_schema(&schema_set_from(sdl, source));

        let diagnostics = result.expect_err("missing root query type should error");
        assert_eq!(
            diagnostics[0].location().source_location(),
            source,
            "the error should point back at the original source, not a generated location"
        );
    }

    #[test]
    fn errors_on_non_input_argument_type() {
        expect_build_error(
            "type Query { bad(arg: User): String }\n\ntype User { id: ID }",
            "Input type `User` must be a scalar, enum, or input object type in the schema set",
        );
    }

    #[test]
    fn errors_on_non_output_field_type() {
        expect_build_error(
            "input Filter { id: ID }\n\ntype Query { bad: Filter }",
            "Output type `Filter` must be an object, interface, union, enum, or scalar type in the schema set",
        );
    }

    #[test]
    fn errors_on_missing_union_member_type() {
        expect_build_error(
            "union MissingUnion = Missing\n\ntype Query { id: ID }",
            "Type `Missing` is referenced but not defined in the schema set",
        );
    }

    #[test]
    fn errors_on_missing_implemented_interface_type() {
        expect_build_error(
            "type Query implements Missing { id: ID }",
            "Type `Missing` is referenced but not defined in the schema set",
        );
    }

    #[test]
    fn errors_on_missing_implemented_interface_at_member_source() {
        let first_source = SourceLocationKey::standalone("first.graphql");
        let second_source = SourceLocationKey::standalone("second.graphql");
        let second_sdl = "type Shared implements Missing { name: String }";
        let schema_set = schema_set_from_two_sources(
            "type Query { id: ID }\n\ntype Shared { id: ID }",
            first_source,
            second_sdl,
            second_source,
        );
        let missing_start = second_sdl.find("Missing").unwrap();

        let diagnostics =
            build_in_memory_schema(&schema_set).expect_err("missing interface should error");

        assert_eq!(
            diagnostics[0].location().source_location(),
            second_source,
            "the error should point at the `implements` member source, not the merged type's first definition"
        );
        assert_eq!(
            diagnostics[0].location().span(),
            Span::from_usize(missing_start, missing_start + "Missing".len()),
        );
    }

    #[test]
    fn errors_on_missing_union_member_at_member_source() {
        let first_source = SourceLocationKey::standalone("first.graphql");
        let second_source = SourceLocationKey::standalone("second.graphql");
        let second_sdl = "union Result = Missing";
        let schema_set = schema_set_from_two_sources(
            "type Query { id: ID }\n\ntype Known { id: ID }\n\nunion Result = Known",
            first_source,
            second_sdl,
            second_source,
        );
        let missing_start = second_sdl.find("Missing").unwrap();

        let diagnostics =
            build_in_memory_schema(&schema_set).expect_err("missing union member should error");

        assert_eq!(
            diagnostics[0].location().source_location(),
            second_source,
            "the error should point at the union member source, not the merged union's first definition"
        );
        assert_eq!(
            diagnostics[0].location().span(),
            Span::from_usize(missing_start, missing_start + "Missing".len()),
        );
    }

    #[test]
    fn errors_on_extension_only_type_at_extension_source() {
        let base = "type Query { id: ID }";
        let extension = "extend type Missing { id: ID }";
        let base_source = SourceLocationKey::standalone("base.graphql");
        let extension_source = SourceLocationKey::standalone("extension.graphql");
        let schema_set =
            schema_set_from_base_and_extensions(base, base_source, extension, extension_source)
                .unwrap();

        let diagnostics =
            build_sdl_schema(&schema_set).expect_err("extension-only type should error");

        assert_eq!(
            diagnostics[0].location().source_location(),
            extension_source,
            "the error should point back at the source extension, not generated SDL"
        );
    }

    #[test]
    fn field_type_merge_error_uses_incoming_source() {
        let base = "type Query { node: Node }\n\ntype Node { id: ID }";
        let extension = "extend type Query { node: String }";
        let base_source = SourceLocationKey::standalone("base.graphql");
        let extension_source = SourceLocationKey::standalone("extension.graphql");

        let diagnostics =
            schema_set_from_base_and_extensions(base, base_source, extension, extension_source)
                .expect_err("changing a field's object type to a scalar should error");

        assert_eq!(
            diagnostics[0].location().source_location(),
            extension_source,
            "the error should point back at the changed field source, not generated SDL"
        );
    }
}
