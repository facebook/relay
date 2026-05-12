/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Removes references from a base schema to items that are *defined* in an exclude schema.
//!
//! This is different from the `set_exclude` operation which performs set subtraction.
//! This operation:
//! - Removes usages of directives that are defined in the exclude schema
//! - Removes `implements Interface` where Interface is defined in the exclude schema
//! - Removes union members where the type is defined in the exclude schema
//!
//! The resulting schema is the base schema with all references to exclude-defined items removed.

use intern::string_key::StringKey;
use intern::string_key::StringKeyIndexMap;
use intern::string_key::StringKeyMap;
use intern::string_key::StringKeySet;
use lazy_static::lazy_static;

use crate::SchemaSet;
use crate::SetDirective;
use crate::SetEnum;
use crate::SetEnumValue;
use crate::SetInputObject;
use crate::SetInterface;
use crate::SetMemberType;
use crate::SetObject;
use crate::SetScalar;
use crate::SetType;
use crate::SetUnion;
use crate::schema_set::HasDefinitionItem;
use crate::schema_set::SetDirectiveValue;
use crate::schema_set::SetRootSchema;
use crate::schema_set::StringKeyNamed;

lazy_static! {
    static ref EMPTY_STRING_KEY_SET: StringKeySet = StringKeySet::default();
}

impl SchemaSet {
    /// Removes references from this schema to items that are *defined* in the exclude schema.
    ///
    /// This operation:
    /// - Removes usages of directives that are defined in `to_exclude`
    /// - Removes `implements Interface` where Interface is defined in `to_exclude`
    /// - Removes union members where the type is defined in `to_exclude`
    /// - Removes types that are defined in `to_exclude` entirely
    /// - Removes directives that are defined in `to_exclude` entirely
    ///
    /// This is useful for stripping client-specific extensions from a schema to make it
    /// server-compatible.
    pub fn remove_defined_references(&self, to_exclude: &SchemaSet) -> SchemaSet {
        // Collect the names of items defined in the exclude schema
        let excluded_directive_names: StringKeySet =
            to_exclude.directives.keys().cloned().collect();
        let excluded_type_names: StringKeySet = to_exclude
            .types
            .iter()
            .filter_map(|(name, t)| {
                // If using `extend T` then the underlying base type is NOT a client definition and should NOT be removed.
                // Only the fields under this definition should be removed.
                if t.is_client_definition() {
                    None
                } else {
                    Some(*name)
                }
            })
            .collect();
        let excluded_interface_names: StringKeySet = to_exclude
            .types
            .iter()
            .filter_map(|(name, t)| {
                if !t.is_client_definition() && matches!(t, SetType::Interface(_)) {
                    Some(*name)
                } else {
                    None
                }
            })
            .collect();

        // Collect fields to exclude from client-definition (extend type/interface) types.
        // These types are NOT fully removed, but their fields should be stripped
        // from the base schema.
        let mut excluded_fields_by_type: StringKeyMap<StringKeySet> = StringKeyMap::default();
        for (name, t) in &to_exclude.types {
            if !t.is_client_definition() {
                continue;
            }
            let field_names: StringKeySet = match t {
                SetType::Object(obj) => obj.fields.keys().cloned().collect(),
                SetType::Interface(iface) => iface.fields.keys().cloned().collect(),
                _ => continue,
            };
            if !field_names.is_empty() {
                excluded_fields_by_type
                    .entry(*name)
                    .or_default()
                    .extend(field_names);
            }
        }

        // Propagate excluded fields from interfaces to all types that implement them.
        // If `extend interface Foo { fieldX }` is in the exclude schema, then `fieldX`
        // should also be removed from any type in the base schema that implements `Foo`.
        let excluded_interface_fields: Vec<(StringKey, StringKeySet)> = excluded_fields_by_type
            .iter()
            .filter(|(name, _)| {
                to_exclude
                    .types
                    .get(name)
                    .is_some_and(|t| matches!(t, SetType::Interface(_)))
            })
            .map(|(name, fields)| (*name, fields.clone()))
            .collect();

        if !excluded_interface_fields.is_empty() {
            for type_ in self.types.values() {
                let implemented_interfaces = match type_ {
                    SetType::Object(obj) => Some(&obj.interfaces),
                    SetType::Interface(iface) => Some(&iface.interfaces),
                    _ => None,
                };
                if let Some(interfaces) = implemented_interfaces {
                    for (iface_name, iface_fields) in &excluded_interface_fields {
                        if interfaces.contains_key(iface_name) {
                            let type_name = type_.string_key_name();
                            excluded_fields_by_type
                                .entry(type_name)
                                .or_default()
                                .extend(iface_fields.iter().cloned());
                        }
                    }
                }
            }
        }

        SchemaSet {
            root_schema: remove_directive_usages_from_root_schema(
                &self.root_schema,
                &excluded_directive_names,
            ),
            directives: self
                .directives
                .iter()
                .filter_map(|(name, directive)| {
                    if excluded_directive_names.contains(name) {
                        // Remove directives that are defined in the exclude schema
                        None
                    } else {
                        Some((
                            *name,
                            remove_directive_usages_from_directive(
                                directive,
                                &excluded_directive_names,
                            ),
                        ))
                    }
                })
                .collect(),
            types: self
                .types
                .iter()
                .filter_map(|(name, type_)| {
                    if excluded_type_names.contains(name) {
                        // Remove types that are defined in the exclude schema
                        None
                    } else {
                        Some((
                            *name,
                            remove_references_from_type(
                                type_,
                                &excluded_directive_names,
                                &excluded_interface_names,
                                excluded_fields_by_type
                                    .get(name)
                                    .unwrap_or(&EMPTY_STRING_KEY_SET),
                                &excluded_type_names,
                            ),
                        ))
                    }
                })
                .collect(),
        }
    }
}

fn remove_directive_usages(
    directives: &[SetDirectiveValue],
    excluded_directive_names: &StringKeySet,
) -> Vec<SetDirectiveValue> {
    directives
        .iter()
        .filter(|d| !excluded_directive_names.contains(&d.name.0))
        .cloned()
        .collect()
}

fn remove_set_directive_usages(
    directives: &[SetDirectiveValue],
    excluded_directive_names: &StringKeySet,
) -> Vec<SetDirectiveValue> {
    directives
        .iter()
        .filter(|d| !excluded_directive_names.contains(&d.name.0))
        .cloned()
        .collect()
}

fn remove_directive_usages_from_root_schema(
    root_schema: &SetRootSchema,
    excluded_directive_names: &StringKeySet,
) -> SetRootSchema {
    SetRootSchema {
        definition: root_schema.definition.clone(),
        directives: remove_directive_usages(&root_schema.directives, excluded_directive_names),
        query_type: root_schema.query_type,
        mutation_type: root_schema.mutation_type,
        subscription_type: root_schema.subscription_type,
    }
}

fn remove_directive_usages_from_directive(
    directive: &SetDirective,
    excluded_directive_names: &StringKeySet,
) -> SetDirective {
    SetDirective {
        definition: directive.definition.clone(),
        locations: directive.locations.clone(),
        arguments: directive
            .arguments
            .iter()
            .map(|(name, arg)| {
                (
                    *name,
                    crate::SetArgument {
                        definition: arg.definition.clone(),
                        directives: remove_directive_usages(
                            &arg.directives,
                            excluded_directive_names,
                        ),
                        type_: arg.type_.clone(),
                        name: arg.name,
                        default_value: arg.default_value.clone(),
                    },
                )
            })
            .collect(),
        name: directive.name,
        repeatable: directive.repeatable,
    }
}

fn remove_references_from_type(
    type_: &SetType,
    excluded_directive_names: &StringKeySet,
    excluded_interface_names: &StringKeySet,
    excluded_field_names: &StringKeySet,
    excluded_type_names: &StringKeySet,
) -> SetType {
    match type_ {
        SetType::Scalar(scalar) => SetType::Scalar(remove_references_from_scalar(
            scalar,
            excluded_directive_names,
        )),
        SetType::Enum(enum_) => {
            SetType::Enum(remove_references_from_enum(enum_, excluded_directive_names))
        }
        SetType::Object(object) => SetType::Object(remove_references_from_object(
            object,
            excluded_directive_names,
            excluded_interface_names,
            excluded_field_names,
            excluded_type_names,
        )),
        SetType::Interface(interface) => SetType::Interface(remove_references_from_interface(
            interface,
            excluded_directive_names,
            excluded_interface_names,
            excluded_field_names,
            excluded_type_names,
        )),
        SetType::Union(union_) => SetType::Union(remove_references_from_union(
            union_,
            excluded_directive_names,
            excluded_type_names,
        )),
        SetType::InputObject(input_object) => SetType::InputObject(
            remove_references_from_input_object(input_object, excluded_directive_names),
        ),
    }
}

fn remove_references_from_scalar(
    scalar: &SetScalar,
    excluded_directive_names: &StringKeySet,
) -> SetScalar {
    SetScalar {
        definition: scalar.definition.clone(),
        directives: remove_directive_usages(&scalar.directives, excluded_directive_names),
        name: scalar.name,
    }
}

fn remove_references_from_enum(
    enum_: &SetEnum,
    excluded_directive_names: &StringKeySet,
) -> SetEnum {
    SetEnum {
        definition: enum_.definition.clone(),
        directives: remove_directive_usages(&enum_.directives, excluded_directive_names),
        values: enum_
            .values
            .iter()
            .map(|(name, value)| {
                (
                    *name,
                    SetEnumValue {
                        definition: None,
                        value: value.value,
                        directives: remove_set_directive_usages(
                            &value.directives,
                            excluded_directive_names,
                        ),
                        description: value.description,
                    },
                )
            })
            .collect(),
        name: enum_.name,
    }
}

fn remove_interfaces_from_implements(
    interfaces: &StringKeyIndexMap<SetMemberType>,
    excluded_interface_names: &StringKeySet,
) -> StringKeyIndexMap<SetMemberType> {
    interfaces
        .iter()
        .filter(|(name, _)| !excluded_interface_names.contains(name))
        .map(|(name, member)| (*name, member.clone()))
        .collect()
}

fn remove_references_from_fields(
    fields: &StringKeyMap<crate::SetField>,
    excluded_directive_names: &StringKeySet,
    excluded_field_names: &StringKeySet,
    excluded_type_names: &StringKeySet,
) -> StringKeyMap<crate::SetField> {
    fields
        .iter()
        .filter(|(name, field)| {
            // Remove fields that are defined in the exclude schema's client extensions
            if excluded_field_names.contains(name) {
                return false;
            }
            // Remove fields whose return type is an excluded type
            if excluded_type_names.contains(&field.type_.inner()) {
                return false;
            }
            true
        })
        .map(|(name, field)| {
            (
                *name,
                crate::SetField {
                    definition: field.definition.clone(),
                    arguments: field
                        .arguments
                        .iter()
                        .map(|(arg_name, arg)| {
                            (
                                *arg_name,
                                crate::SetArgument {
                                    definition: arg.definition.clone(),
                                    directives: remove_directive_usages(
                                        &arg.directives,
                                        excluded_directive_names,
                                    ),
                                    type_: arg.type_.clone(),
                                    name: arg.name,
                                    default_value: arg.default_value.clone(),
                                },
                            )
                        })
                        .collect(),
                    directives: remove_directive_usages(
                        &field.directives,
                        excluded_directive_names,
                    ),
                    name: field.name,
                    type_: field.type_.clone(),
                },
            )
        })
        .collect()
}

fn remove_references_from_object(
    object: &SetObject,
    excluded_directive_names: &StringKeySet,
    excluded_interface_names: &StringKeySet,
    excluded_field_names: &StringKeySet,
    excluded_type_names: &StringKeySet,
) -> SetObject {
    SetObject {
        definition: object.definition.clone(),
        interfaces: remove_interfaces_from_implements(&object.interfaces, excluded_interface_names),
        directives: remove_directive_usages(&object.directives, excluded_directive_names),
        fields: remove_references_from_fields(
            &object.fields,
            excluded_directive_names,
            excluded_field_names,
            excluded_type_names,
        ),
        name: object.name,
    }
}

fn remove_references_from_interface(
    interface: &SetInterface,
    excluded_directive_names: &StringKeySet,
    excluded_interface_names: &StringKeySet,
    excluded_field_names: &StringKeySet,
    excluded_type_names: &StringKeySet,
) -> SetInterface {
    SetInterface {
        definition: interface.definition.clone(),
        interfaces: remove_interfaces_from_implements(
            &interface.interfaces,
            excluded_interface_names,
        ),
        directives: remove_directive_usages(&interface.directives, excluded_directive_names),
        fields: remove_references_from_fields(
            &interface.fields,
            excluded_directive_names,
            excluded_field_names,
            excluded_type_names,
        ),
        name: interface.name,
    }
}

fn remove_references_from_union(
    union_: &SetUnion,
    excluded_directive_names: &StringKeySet,
    excluded_type_names: &StringKeySet,
) -> SetUnion {
    SetUnion {
        definition: union_.definition.clone(),
        members: union_
            .members
            .iter()
            .filter(|(name, _)| !excluded_type_names.contains(name))
            .map(|(name, member)| (*name, member.clone()))
            .collect(),
        directives: remove_directive_usages(&union_.directives, excluded_directive_names),
        name: union_.name,
    }
}

fn remove_references_from_input_object(
    input_object: &SetInputObject,
    excluded_directive_names: &StringKeySet,
) -> SetInputObject {
    SetInputObject {
        definition: input_object.definition.clone(),
        directives: remove_directive_usages(&input_object.directives, excluded_directive_names),
        fields: input_object
            .fields
            .iter()
            .map(|(name, arg)| {
                (
                    *name,
                    crate::SetArgument {
                        definition: arg.definition.clone(),
                        directives: remove_directive_usages(
                            &arg.directives,
                            excluded_directive_names,
                        ),
                        type_: arg.type_.clone(),
                        name: arg.name,
                        default_value: arg.default_value.clone(),
                    },
                )
            })
            .collect(),
        name: input_object.name,
        fully_recursively_visited: input_object.fully_recursively_visited,
    }
}

#[cfg(test)]
mod tests {
    use common::DirectiveName;
    use common::SourceLocationKey;
    use graphql_syntax::parse_schema_document;
    use intern::string_key::Intern;

    use super::*;

    fn set_from_str(sdl: &str) -> SchemaSet {
        SchemaSet::from_base_schema_documents(&[parse_schema_document(
            sdl,
            SourceLocationKey::generated(),
        )
        .unwrap()])
        .unwrap()
    }

    #[test]
    fn test_remove_directive_definitions_and_usages() {
        let base = r#"
            directive @client_only on FIELD_DEFINITION
            directive @server on FIELD_DEFINITION

            type Query {
                field1: String @client_only
                field2: String @server
                field3: String
            }
        "#;

        let exclude = r#"
            directive @client_only on FIELD_DEFINITION
        "#;

        let result = set_from_str(base).remove_defined_references(&set_from_str(exclude));

        // @client_only directive definition should be removed
        assert!(!result.directives.contains_key(&"client_only".intern()));
        // @server directive should still be present
        assert!(result.directives.contains_key(&"server".intern()));

        // Check field directives on Query type
        let query_type = result.types.get(&"Query".intern()).unwrap();
        if let SetType::Object(obj) = query_type {
            let field1 = obj.fields.get(&"field1".intern()).unwrap();
            let field2 = obj.fields.get(&"field2".intern()).unwrap();

            // field1 should have no directives (client_only was removed)
            assert!(field1.directives.is_empty());
            // field2 should still have @server
            assert!(
                field2
                    .directives
                    .iter()
                    .any(|d| d.name == DirectiveName("server".intern()))
            );
        } else {
            panic!("Query should be an object type");
        }
    }

    #[test]
    fn test_remove_interface_implementations() {
        let base = r#"
            interface ClientInterface {
                id: ID!
            }

            interface ServerInterface {
                name: String!
            }

            type MyType implements ClientInterface & ServerInterface {
                id: ID!
                name: String!
            }
        "#;

        let exclude = r#"
            interface ClientInterface {
                id: ID!
            }
        "#;

        let result = set_from_str(base).remove_defined_references(&set_from_str(exclude));

        // ClientInterface should be completely removed from types
        assert!(!result.types.contains_key(&"ClientInterface".intern()));
        // ServerInterface should still be present
        assert!(result.types.contains_key(&"ServerInterface".intern()));

        // MyType should only implement ServerInterface
        let my_type = result.types.get(&"MyType".intern()).unwrap();
        if let SetType::Object(obj) = my_type {
            assert!(!obj.interfaces.contains_key(&"ClientInterface".intern()));
            assert!(obj.interfaces.contains_key(&"ServerInterface".intern()));
        } else {
            panic!("MyType should be an object type");
        }
    }

    #[test]
    fn test_remove_union_members() {
        let base = r#"
            type ClientType {
                id: ID!
            }

            type ServerType {
                name: String!
            }

            union MyUnion = ClientType | ServerType
        "#;

        let exclude = r#"
            type ClientType {
                id: ID!
            }
        "#;

        let result = set_from_str(base).remove_defined_references(&set_from_str(exclude));

        // ClientType should be completely removed
        assert!(!result.types.contains_key(&"ClientType".intern()));
        // ServerType should still be present
        assert!(result.types.contains_key(&"ServerType".intern()));

        // MyUnion should only contain ServerType
        let my_union = result.types.get(&"MyUnion".intern()).unwrap();
        if let SetType::Union(union_type) = my_union {
            assert!(!union_type.members.contains_key(&"ClientType".intern()));
            assert!(union_type.members.contains_key(&"ServerType".intern()));
        } else {
            panic!("MyUnion should be a union type");
        }
    }

    #[test]
    fn test_remove_types_defined_in_exclude() {
        let base = r#"
            type ClientOnlyType {
                id: ID!
            }

            type ServerType {
                name: String!
            }
        "#;

        let exclude = r#"
            type ClientOnlyType {
                id: ID!
            }
        "#;

        let result = set_from_str(base).remove_defined_references(&set_from_str(exclude));

        // ClientOnlyType should be removed
        assert!(!result.types.contains_key(&"ClientOnlyType".intern()));
        // ServerType should still be present
        assert!(result.types.contains_key(&"ServerType".intern()));
    }

    #[test]
    fn test_combined_removal() {
        let base = r#"
            directive @client_directive on FIELD_DEFINITION

            interface ClientInterface {
                clientField: String!
            }

            type ClientType {
                id: ID!
            }

            type ServerType implements ClientInterface {
                clientField: String! @client_directive
                serverField: String!
            }

            union MixedUnion = ClientType | ServerType
        "#;

        let exclude = r#"
            directive @client_directive on FIELD_DEFINITION

            interface ClientInterface {
                clientField: String!
            }

            type ClientType {
                id: ID!
            }

            extend type ServerType {
                anotherClientField: String
            }
        "#;

        let result = set_from_str(base).remove_defined_references(&set_from_str(exclude));

        // All client items should be removed
        assert!(!result.directives.contains_key(&"client_directive".intern()));
        assert!(!result.types.contains_key(&"ClientInterface".intern()));
        assert!(!result.types.contains_key(&"ClientType".intern()));

        // ServerType should remain but without client references
        let server_type = result.types.get(&"ServerType".intern()).unwrap();
        if let SetType::Object(obj) = server_type {
            // Should not implement ClientInterface
            assert!(!obj.interfaces.contains_key(&"ClientInterface".intern()));
            // clientField should have no directives
            let client_field = obj.fields.get(&"clientField".intern()).unwrap();
            assert!(client_field.directives.is_empty());
        } else {
            panic!("ServerType should be an object type");
        }

        // MixedUnion should only have ServerType
        let mixed_union = result.types.get(&"MixedUnion".intern()).unwrap();
        if let SetType::Union(union_type) = mixed_union {
            assert!(!union_type.members.contains_key(&"ClientType".intern()));
            assert!(union_type.members.contains_key(&"ServerType".intern()));
        } else {
            panic!("MixedUnion should be a union type");
        }
    }

    #[test]
    fn test_remove_fields_from_extend_type() {
        let base = r#"
            type MyType {
                serverField: String!
                clientField: Int
                anotherClientField: Boolean
            }
        "#;

        let exclude = r#"
            extend type MyType {
                clientField: Int
                anotherClientField: Boolean
            }
        "#;

        let result = set_from_str(base).remove_defined_references(&set_from_str(exclude));

        // MyType should still exist (it's an extend, not a full definition)
        let my_type = result.types.get(&"MyType".intern()).unwrap();
        if let SetType::Object(obj) = my_type {
            // serverField should remain
            assert!(obj.fields.contains_key(&"serverField".intern()));
            // client fields should be removed
            assert!(!obj.fields.contains_key(&"clientField".intern()));
            assert!(!obj.fields.contains_key(&"anotherClientField".intern()));
        } else {
            panic!("MyType should be an object type");
        }
    }

    #[test]
    fn test_remove_fields_from_extend_interface_propagates_to_implementors() {
        let base = r#"
            interface MyInterface {
                serverField: String!
                clientField: Int
            }

            type MyType implements MyInterface {
                serverField: String!
                clientField: Int
                typeOnlyField: Boolean
            }

            interface SubInterface implements MyInterface {
                serverField: String!
                clientField: Int
            }
        "#;

        let exclude = r#"
            extend interface MyInterface {
                clientField: Int
            }
        "#;

        let result = set_from_str(base).remove_defined_references(&set_from_str(exclude));

        // MyInterface should still exist but without clientField
        let my_iface = result.types.get(&"MyInterface".intern()).unwrap();
        if let SetType::Interface(iface) = my_iface {
            assert!(iface.fields.contains_key(&"serverField".intern()));
            assert!(!iface.fields.contains_key(&"clientField".intern()));
        } else {
            panic!("MyInterface should be an interface type");
        }

        // MyType implements MyInterface, so clientField should also be removed
        let my_type = result.types.get(&"MyType".intern()).unwrap();
        if let SetType::Object(obj) = my_type {
            assert!(obj.fields.contains_key(&"serverField".intern()));
            assert!(obj.fields.contains_key(&"typeOnlyField".intern()));
            assert!(!obj.fields.contains_key(&"clientField".intern()));
        } else {
            panic!("MyType should be an object type");
        }

        // SubInterface implements MyInterface, so clientField should also be removed
        let sub_iface = result.types.get(&"SubInterface".intern()).unwrap();
        if let SetType::Interface(iface) = sub_iface {
            assert!(iface.fields.contains_key(&"serverField".intern()));
            assert!(!iface.fields.contains_key(&"clientField".intern()));
        } else {
            panic!("SubInterface should be an interface type");
        }
    }

    #[test]
    fn test_remove_enum_types() {
        let base = r#"
            enum ClientAction {
                DO_SOMETHING
                DO_SOMETHING_ELSE
            }

            enum ServerAction {
                PROCESS
                COMPLETE
            }

            directive @client_directive(action: ClientAction!) on FIELD_DEFINITION

            type Query {
                field1: String
            }
        "#;

        let exclude = r#"
            enum ClientAction {
                DO_SOMETHING
                DO_SOMETHING_ELSE
            }

            directive @client_directive(action: ClientAction!) on FIELD_DEFINITION
        "#;

        let result = set_from_str(base).remove_defined_references(&set_from_str(exclude));

        // ClientAction enum should be removed
        assert!(!result.types.contains_key(&"ClientAction".intern()));
        // ServerAction enum should still be present
        assert!(result.types.contains_key(&"ServerAction".intern()));
        // client_directive should be removed
        assert!(!result.directives.contains_key(&"client_directive".intern()));
    }
}
