/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::BTreeMap;
use std::collections::VecDeque;

use common::ArgumentName;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::EnumName;
use common::InputObjectName;
use common::InterfaceName;
use common::Location;
use common::NamedItem;
use common::ObjectName;
use common::ScalarName;
use common::SourceLocationKey;
use common::UnionName;
use graphql_syntax::ConstantArgument;
use graphql_syntax::ConstantDirective;
use graphql_syntax::ConstantValue;
use graphql_syntax::DirectiveDefinition;
use graphql_syntax::EnumTypeDefinition;
use graphql_syntax::ExtensionIntoDefinition;
use graphql_syntax::FieldDefinition;
use graphql_syntax::Identifier;
use graphql_syntax::InputObjectTypeDefinition;
use graphql_syntax::InputValueDefinition;
use graphql_syntax::InterfaceTypeDefinition;
use graphql_syntax::List;
use graphql_syntax::ObjectTypeDefinition;
use graphql_syntax::OperationType;
use graphql_syntax::ScalarTypeDefinition;
use graphql_syntax::SchemaDefinition;
use graphql_syntax::TypeAnnotation;
use graphql_syntax::UnionTypeDefinition;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use intern::string_key::StringKeyIndexMap;
use intern::string_key::StringKeyMap;
use schema::TypeReference;

use crate::OutputNonNull;
use crate::OutputTypeReference;
use crate::SEMANTIC_NON_NULL;
use crate::SEMANTIC_NON_NULL_LEVELS_ARG;
use crate::schema_set::FieldName;
use crate::schema_set::SchemaDefinitionItem;
use crate::schema_set::SetArgument;
use crate::schema_set::SetArgumentValue;
use crate::schema_set::SetDirective;
use crate::schema_set::SetDirectiveValue;
use crate::schema_set::SetEnum;
use crate::schema_set::SetEnumValue;
use crate::schema_set::SetField;
use crate::schema_set::SetInputObject;
use crate::schema_set::SetInterface;
use crate::schema_set::SetMemberType;
use crate::schema_set::SetObject;
use crate::schema_set::SetRootSchema;
use crate::schema_set::SetScalar;
use crate::schema_set::SetType;
use crate::schema_set::SetUnion;
use crate::schema_set::StringKeyNamed;
use crate::set_merges::Merges;

pub trait ToSetDefinition<T> {
    /// Build a `T` "set definition" from a parsed GraphQL syntax node.
    ///
    /// `is_extends` indicates that this conversion is happening on behalf of
    /// an `extend X { ... }` SDL node rather than a fresh `X { ... }`
    /// definition. For top-level type kinds (`SetObject`, `SetInterface`,
    /// `SetUnion`, `SetScalar`, `SetEnum`, `SetInputObject`) this controls
    /// whether the resulting `definition: Option<SchemaDefinitionItem>` field
    /// is populated (`is_extends = false`) or left as `None`
    /// (`is_extends = true`). The presence/absence of that field is what
    /// `to_sdl_definition` later uses to decide whether to emit the entry as
    /// a `*TypeDefinition` or a `*TypeExtension`. (This is hacky: ideally
    /// `is_extends` would be its own field on `SchemaDefinitionItem`, but
    /// today the absence of `definition` is the only signal we have.)
    ///
    /// Sub-element impls (`SetField`, `SetArgument`, `SetDirectiveValue`,
    /// `SetArgumentValue`) ignore `is_extends` because their `definition`
    /// field always tracks the field/argument's own declaration site.
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
        is_extends: bool,
    ) -> T;
}

pub fn merge_def_into<
    TypeDef: ToSetDefinition<SetDefinition>,
    SetDefinition: StringKeyNamed + Merges,
>(
    merge_map: &mut StringKeyMap<SetDefinition>,
    type_def: &TypeDef,
    source: SourceLocationKey,
    is_client_definition: bool,
) -> DiagnosticsResult<()> {
    let merge_type = type_def.to_set_definition(source, is_client_definition, false);
    let name = merge_type.string_key_name();
    if let Some(exists) = merge_map.get_mut(&name) {
        exists.merge(merge_type)?;
    } else {
        merge_map.insert(name, merge_type);
    }
    Ok(())
}

pub fn merge_ext_into<
    TypeExt: ExtensionIntoDefinition + Clone,
    SetDefinition: StringKeyNamed + Merges,
>(
    used_map: &mut StringKeyMap<SetDefinition>,
    type_ext: &TypeExt,
    source: SourceLocationKey,
) -> DiagnosticsResult<()>
where
    TypeExt::DefinitionType: ToSetDefinition<SetDefinition>,
{
    let set_type = type_ext
        .clone()
        .into_definition()
        // today extensions are ALWAYS client definitions only. However, if there exists a base definition already,
        // this will be a no-op.
        // However, any *fields* we merge in from an extension need to be annotated as being
        // an extension field.
        //
        // `is_extends = true` ensures the resulting `SetType` has
        // `definition: None`, so `Merges::merge` correctly treats this entry
        // as extension-only when there's no pre-existing base entry, and so
        // `to_sdl_definition` round-trips it back as `extend X { ... }`
        // rather than `X { ... }` (which would conflict with the base on
        // re-import via `SDLSchema::build`).
        .to_set_definition(source, true, true);
    let name = set_type.string_key_name();
    if let Some(exists) = used_map.get_mut(&name) {
        exists.merge(set_type)?;
    } else {
        used_map.insert(name, set_type);
    }
    Ok(())
}

impl ToSetDefinition<SetRootSchema> for SchemaDefinition {
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
        is_extends: bool,
    ) -> SetRootSchema {
        let mut set_root_schema = SetRootSchema {
            definition: (!is_extends).then(|| SchemaDefinitionItem {
                name: "schema".intern(),
                locations: vec![Location::new(source, self.span)],
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: None,
            }),
            directives: build_directive_values(&self.directives, source, is_client_definition),
            ..Default::default()
        };

        for operation_type in &self.operation_types.items {
            match operation_type.operation {
                OperationType::Query => {
                    set_root_schema.query_type = Some(operation_type.type_.value)
                }
                OperationType::Mutation => {
                    set_root_schema.mutation_type = Some(operation_type.type_.value)
                }
                OperationType::Subscription => {
                    set_root_schema.subscription_type = Some(operation_type.type_.value)
                }
            }
        }
        set_root_schema
    }
}

impl ToSetDefinition<SetType> for EnumTypeDefinition {
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
        is_extends: bool,
    ) -> SetType {
        let directives = build_directive_values(&self.directives, source, is_client_definition);
        let values = self.values.as_ref().map_or(BTreeMap::default(), |v| {
            v.items
                .iter()
                .map(|value| {
                    (
                        value.name.value,
                        SetEnumValue {
                            definition: Some(SchemaDefinitionItem {
                                name: value.name.value,
                                locations: vec![Location::new(source, value.span)],
                                is_client_definition,
                                description: value.description.as_ref().map(|d| d.value),
                                hack_source: None,
                            }),
                            value: value.name.value,
                            directives: build_directive_values(
                                &value.directives,
                                source,
                                is_client_definition,
                            ),
                            description: value.description.as_ref().map(|d| d.value),
                        },
                    )
                })
                .collect()
        });
        SetType::Enum(SetEnum {
            definition: (!is_extends).then(|| SchemaDefinitionItem {
                name: self.name.value,
                locations: vec![Location::new(source, self.name.span)],
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: None,
            }),
            name: EnumName(self.name.value),
            values,
            directives,
        })
    }
}

impl ToSetDefinition<SetType> for InterfaceTypeDefinition {
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
        is_extends: bool,
    ) -> SetType {
        SetType::Interface(SetInterface {
            definition: (!is_extends).then(|| SchemaDefinitionItem {
                name: self.name.value,
                locations: vec![Location::new(source, self.name.span)],
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: None,
            }),
            name: InterfaceName(self.name.value),
            fields: build_fields(self.fields.as_ref(), source, is_client_definition),
            interfaces: build_members(&self.interfaces, is_client_definition),
            directives: build_directive_values(&self.directives, source, is_client_definition),
        })
    }
}

impl ToSetDefinition<SetType> for ObjectTypeDefinition {
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
        is_extends: bool,
    ) -> SetType {
        SetType::Object(SetObject {
            definition: (!is_extends).then(|| SchemaDefinitionItem {
                name: self.name.value,
                locations: vec![Location::new(source, self.name.span)],
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: None,
            }),
            name: ObjectName(self.name.value),
            fields: build_fields(self.fields.as_ref(), source, is_client_definition),
            interfaces: build_members(&self.interfaces, is_client_definition),
            directives: build_directive_values(&self.directives, source, is_client_definition),
        })
    }
}

impl ToSetDefinition<SetType> for UnionTypeDefinition {
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
        is_extends: bool,
    ) -> SetType {
        SetType::Union(SetUnion {
            definition: (!is_extends).then(|| SchemaDefinitionItem {
                name: self.name.value,
                locations: vec![Location::new(source, self.name.span)],
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: None,
            }),
            members: build_members(&self.members, is_client_definition),
            name: UnionName(self.name.value),
            directives: build_directive_values(&self.directives, source, is_client_definition),
        })
    }
}

impl ToSetDefinition<SetType> for InputObjectTypeDefinition {
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
        is_extends: bool,
    ) -> SetType {
        SetType::InputObject(SetInputObject {
            definition: (!is_extends).then(|| SchemaDefinitionItem {
                name: self.name.value,
                locations: vec![Location::new(source, self.name.span)],
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: None,
            }),
            fields: build_argument_values(self.fields.as_ref(), source, is_client_definition),
            name: InputObjectName(self.name.value),
            directives: build_directive_values(
                self.directives.as_ref(),
                source,
                is_client_definition,
            ),
            fully_recursively_visited: false,
        })
    }
}

impl ToSetDefinition<SetType> for ScalarTypeDefinition {
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
        is_extends: bool,
    ) -> SetType {
        SetType::Scalar(SetScalar {
            definition: (!is_extends).then(|| SchemaDefinitionItem {
                name: self.name.value,
                locations: vec![Location::new(source, self.name.span)],
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: None,
            }),
            name: ScalarName(self.name.value),
            directives: build_directive_values(
                self.directives.as_ref(),
                source,
                is_client_definition,
            ),
        })
    }
}

impl ToSetDefinition<SetDirective> for DirectiveDefinition {
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
        // GraphQL has no `extend directive`; this is unused but required by
        // the trait signature.
        _is_extends: bool,
    ) -> SetDirective {
        SetDirective {
            definition: Some(SchemaDefinitionItem {
                name: self.name.value,
                locations: vec![Location::new(source, self.name.span)],
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: self.hack_source.as_ref().map(|h| h.value),
            }),
            name: DirectiveName(self.name.value),
            arguments: build_argument_values(self.arguments.as_ref(), source, is_client_definition),
            locations: self.locations.clone(),
            repeatable: self.repeatable,
        }
    }
}

impl ToSetDefinition<SetField> for FieldDefinition {
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
        // Field-level definitions always carry their own `definition` field;
        // top-level extension semantics don't apply.
        _is_extends: bool,
    ) -> SetField {
        SetField {
            definition: Some(SchemaDefinitionItem {
                name: self.name.value,
                locations: vec![Location::new(source, self.name.span)],
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: self.hack_source.as_ref().map(|h| h.value),
            }),
            name: FieldName(self.name.value),
            arguments: build_argument_values(self.arguments.as_ref(), source, is_client_definition),
            type_: build_output_type_reference(&self.type_, &self.directives),
            directives: build_directive_values(&self.directives, source, is_client_definition),
        }
    }
}

impl ToSetDefinition<SetArgument> for InputValueDefinition {
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
        // Input-value definitions always carry their own `definition` field;
        // top-level extension semantics don't apply.
        _is_extends: bool,
    ) -> SetArgument {
        SetArgument {
            definition: Some(SchemaDefinitionItem {
                name: self.name.value,
                locations: vec![Location::new(source, self.name.span)],
                is_client_definition,
                description: None,
                hack_source: None,
            }),
            name: self.name.value,
            type_: build_type_reference(&self.type_),
            default_value: self
                .default_value
                .as_ref()
                .map(|default_value| default_value.value.clone()),
            directives: build_directive_values(&self.directives, source, is_client_definition),
        }
    }
}

impl ToSetDefinition<SetDirectiveValue> for ConstantDirective {
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
        // Directive-application sites are not themselves extensions.
        _is_extends: bool,
    ) -> SetDirectiveValue {
        let arguments = if let Some(arguments) = &self.arguments {
            arguments
                .items
                .iter()
                .map(|argument| argument.to_set_definition(source, is_client_definition, false))
                .collect()
        } else {
            Vec::new()
        };
        SetDirectiveValue {
            definition: Some(SchemaDefinitionItem {
                name: self.name.value,
                locations: vec![Location::new(source, self.span)],
                is_client_definition,
                description: None,
                hack_source: None,
            }),
            name: DirectiveName(self.name.value),
            arguments,
        }
    }
}

impl ToSetDefinition<SetArgumentValue> for ConstantArgument {
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
        // Argument-application sites are not themselves extensions.
        _is_extends: bool,
    ) -> SetArgumentValue {
        SetArgumentValue {
            definition: Some(SchemaDefinitionItem {
                name: self.name.value,
                locations: vec![Location::new(source, self.span)],
                is_client_definition,
                description: None,
                hack_source: None,
            }),
            name: ArgumentName(self.name.value),
            value: self.value.clone(),
        }
    }
}

// NOTE: copy-pasted this private fn from Relay's in_memory::mod crate.
fn build_directive_values(
    directives: &[ConstantDirective],
    source: SourceLocationKey,
    is_client_definition: bool,
) -> Vec<SetDirectiveValue> {
    directives
        .iter()
        .filter(|d| d.name.value != SEMANTIC_NON_NULL.0)
        .map(|directive| directive.to_set_definition(source, is_client_definition, false))
        .collect()
}

fn build_members(members: &[Identifier], is_extension: bool) -> StringKeyIndexMap<SetMemberType> {
    members
        .iter()
        .map(|i| {
            (
                i.value,
                SetMemberType {
                    name: i.value,
                    is_extension,
                },
            )
        })
        .collect()
}

fn build_fields(
    fields: Option<&List<FieldDefinition>>,
    source: SourceLocationKey,
    is_client_definition: bool,
) -> StringKeyMap<SetField> {
    fields
        .map_or(&Vec::new(), |l| &l.items)
        .iter()
        .map(|field| {
            let name = field.name.value;
            (
                name,
                field.to_set_definition(source, is_client_definition, false),
            )
        })
        .collect()
}

fn build_argument_values(
    arguments: Option<&List<InputValueDefinition>>,
    source: SourceLocationKey,
    is_client_definition: bool,
) -> StringKeyIndexMap<SetArgument> {
    arguments.map_or(StringKeyIndexMap::default(), |args| {
        args.items
            .iter()
            .map(|arg| {
                (
                    arg.name.value,
                    SetArgument {
                        definition: Some(SchemaDefinitionItem {
                            name: arg.name.value,
                            locations: vec![Location::new(source, arg.name.span)],
                            is_client_definition,
                            description: arg.description.as_ref().map(|d| d.value),
                            hack_source: None,
                        }),
                        name: arg.name.value,
                        type_: build_type_reference(&arg.type_),
                        default_value: arg
                            .default_value
                            .as_ref()
                            .map(|default_value| default_value.value.clone()),
                        directives: build_directive_values(
                            &arg.directives,
                            source,
                            is_client_definition,
                        ),
                    },
                )
            })
            .collect()
    })
}

fn build_type_reference(type_annotation: &TypeAnnotation) -> TypeReference<StringKey> {
    match type_annotation {
        TypeAnnotation::NonNull(inner) => {
            TypeReference::NonNull(Box::new(build_type_reference(&inner.type_)))
        }
        TypeAnnotation::Named(name) => TypeReference::Named(name.name.value),
        TypeAnnotation::List(inner) => {
            TypeReference::List(Box::new(build_type_reference(&inner.type_)))
        }
    }
}

fn build_output_type_reference(
    type_annotation: &TypeAnnotation,
    directives: &[ConstantDirective],
) -> OutputTypeReference<StringKey> {
    // Following logic for how @semanticNonNull(levels: [Int] = [0]) is defined here:
    // https://relay.dev/docs/guides/semantic-nullability/#proposed-solution
    let mut semantic_non_null_levels: VecDeque<i64> = directives
        .named(SEMANTIC_NON_NULL.0)
        .map_or_else(Default::default, |semantic_non_null_directive| {
            semantic_non_null_directive
                .arguments
                .as_ref()
                .and_then(|arg_list| {
                    arg_list
                        .items
                        .named(SEMANTIC_NON_NULL_LEVELS_ARG.0)
                        .map(|arg| match &arg.value {
                            ConstantValue::List(list_value) => list_value
                                .items
                                .iter()
                                .map(|it| it.unwrap_int())
                                .collect::<VecDeque<_>>(),
                            single => [single.unwrap_int()].into_iter().collect::<VecDeque<_>>(),
                        })
                })
                .unwrap_or_else(|| [0].into_iter().collect())
        });
    build_output_type_reference_with_semantic_nonnull_levels(
        type_annotation,
        &mut semantic_non_null_levels,
    )
}

fn build_output_type_reference_with_semantic_nonnull_levels(
    type_annotation: &TypeAnnotation,
    semantic_non_null_levels: &mut VecDeque<i64>,
) -> OutputTypeReference<StringKey> {
    if let Some(next_semantic_non_null_level) = semantic_non_null_levels.pop_front() {
        if next_semantic_non_null_level == 0 {
            // This level is @semanticNonNull, but it might ALSO be strictly NonNull, in which case just take the strictly NonNull.
            return if let TypeAnnotation::NonNull(_) = type_annotation {
                build_output_type_reference_with_semantic_nonnull_levels(
                    type_annotation,
                    semantic_non_null_levels,
                )
            } else {
                OutputTypeReference::NonNull(OutputNonNull::Semantic(Box::new(
                    build_output_type_reference_with_semantic_nonnull_levels(
                        type_annotation,
                        semantic_non_null_levels,
                    ),
                )))
            };
        } else {
            // Put the value back: it is not 0, so we still need it.
            semantic_non_null_levels.push_front(next_semantic_non_null_level);
            // If we're stepping into a list, then reduce all levels by 1.
            if let TypeAnnotation::List(_) = type_annotation {
                for level in semantic_non_null_levels.iter_mut() {
                    *level -= 1;
                }
            }
        }
    }
    match type_annotation {
        TypeAnnotation::NonNull(inner) => OutputTypeReference::NonNull(OutputNonNull::KillsParent(
            Box::new(build_output_type_reference_with_semantic_nonnull_levels(
                &inner.type_,
                semantic_non_null_levels,
            )),
        )),
        TypeAnnotation::Named(name) => OutputTypeReference::Named(name.name.value),
        TypeAnnotation::List(inner) => OutputTypeReference::List(Box::new(
            build_output_type_reference_with_semantic_nonnull_levels(
                &inner.type_,
                semantic_non_null_levels,
            ),
        )),
    }
}

#[cfg(test)]
mod tests {
    use common::SourceLocationKey;
    use graphql_syntax::parse_schema_document;
    use indoc::indoc;
    use intern::string_key::Intern;

    use super::*;
    use crate::SchemaSet;

    fn set_from_sdl(sdl: &str) -> SchemaSet {
        SchemaSet::from_base_schema_documents(&[parse_schema_document(
            sdl,
            SourceLocationKey::generated(),
        )
        .unwrap()])
        .unwrap()
    }

    // --- merge_def_into ---

    #[test]
    fn test_merge_def_into_new_type() {
        let set = set_from_sdl("type Foo { id: ID! }");
        assert!(set.types.contains_key(&"Foo".intern()));
    }

    #[test]
    fn test_merge_def_into_duplicate_type_merges() {
        let set = set_from_sdl(indoc! {r#"
            type Foo { id: ID! }
            type Foo { name: String }
        "#});
        if let SetType::Object(obj) = set.types.get(&"Foo".intern()).unwrap() {
            assert!(obj.fields.contains_key(&"id".intern()));
            assert!(obj.fields.contains_key(&"name".intern()));
        } else {
            panic!("Expected Object type");
        }
    }

    // --- merge_ext_into ---

    #[test]
    fn test_merge_ext_into() {
        let mut set = SchemaSet::new();
        let base_doc =
            parse_schema_document("type Foo { id: ID! }", SourceLocationKey::generated()).unwrap();
        set.merge_sdl_document(&base_doc, false).unwrap();

        let ext_doc = parse_schema_document(
            "extend type Foo { name: String }",
            SourceLocationKey::generated(),
        )
        .unwrap();
        set.merge_sdl_document(&ext_doc, true).unwrap();

        if let SetType::Object(obj) = set.types.get(&"Foo".intern()).unwrap() {
            assert!(obj.fields.contains_key(&"id".intern()));
            assert!(obj.fields.contains_key(&"name".intern()));
        } else {
            panic!("Expected Object type");
        }
    }

    // --- ToSetDefinition for each GraphQL type kind ---

    #[test]
    fn test_enum_to_set_definition() {
        let set = set_from_sdl(indoc! {r#"
            enum Color {
              RED
              GREEN
            }
        "#});
        if let SetType::Enum(e) = set.types.get(&"Color".intern()).unwrap() {
            assert_eq!(e.name.0, "Color".intern());
            assert!(e.values.contains_key(&"RED".intern()));
            assert!(e.values.contains_key(&"GREEN".intern()));
        } else {
            panic!("Expected Enum type");
        }
    }

    #[test]
    fn test_object_to_set_definition() {
        let set = set_from_sdl(indoc! {r#"
            type User {
              id: ID!
              name: String
            }
        "#});
        if let SetType::Object(obj) = set.types.get(&"User".intern()).unwrap() {
            assert_eq!(obj.name.0, "User".intern());
            assert!(obj.fields.contains_key(&"id".intern()));
            assert!(obj.fields.contains_key(&"name".intern()));
        } else {
            panic!("Expected Object type");
        }
    }

    #[test]
    fn test_interface_to_set_definition() {
        let set = set_from_sdl(indoc! {r#"
            interface Node {
              id: ID!
            }
        "#});
        if let SetType::Interface(iface) = set.types.get(&"Node".intern()).unwrap() {
            assert_eq!(iface.name.0, "Node".intern());
            assert!(iface.fields.contains_key(&"id".intern()));
        } else {
            panic!("Expected Interface type");
        }
    }

    #[test]
    fn test_union_to_set_definition() {
        let set = set_from_sdl(indoc! {r#"
            type Cat { name: String }
            type Dog { name: String }
            union Animal = Cat | Dog
        "#});
        if let SetType::Union(u) = set.types.get(&"Animal".intern()).unwrap() {
            assert_eq!(u.name.0, "Animal".intern());
            assert!(u.members.contains_key(&"Cat".intern()));
            assert!(u.members.contains_key(&"Dog".intern()));
        } else {
            panic!("Expected Union type");
        }
    }

    #[test]
    fn test_input_object_to_set_definition() {
        let set = set_from_sdl(indoc! {r#"
            input CreateInput {
              name: String!
            }
        "#});
        if let SetType::InputObject(input) = set.types.get(&"CreateInput".intern()).unwrap() {
            assert_eq!(input.name.0, "CreateInput".intern());
            assert!(input.fields.contains_key(&"name".intern()));
        } else {
            panic!("Expected InputObject type");
        }
    }

    #[test]
    fn test_scalar_to_set_definition() {
        let set = set_from_sdl("scalar URL");
        if let SetType::Scalar(s) = set.types.get(&"URL".intern()).unwrap() {
            assert_eq!(s.name.0, "URL".intern());
        } else {
            panic!("Expected Scalar type");
        }
    }

    #[test]
    fn test_directive_to_set_definition() {
        let set = set_from_sdl("directive @deprecated(reason: String) on FIELD_DEFINITION");
        let dir = set.directives.get(&"deprecated".intern()).unwrap();
        assert_eq!(dir.name.0, "deprecated".intern());
        assert!(dir.arguments.contains_key(&"reason".intern()));
    }

    // --- Conflicting type kinds ---

    #[test]
    fn test_conflicting_type_kinds_error() {
        let mut set = SchemaSet::new();
        let doc1 =
            parse_schema_document("type Foo { id: ID! }", SourceLocationKey::generated()).unwrap();
        set.merge_sdl_document(&doc1, false).unwrap();

        let doc2 =
            parse_schema_document("enum Foo { A B }", SourceLocationKey::generated()).unwrap();
        let result = set.merge_sdl_document(&doc2, false);
        assert!(
            result.is_err(),
            "Merging conflicting type kinds should produce an error"
        );
    }

    // --- Extension creates new type if not existing ---

    #[test]
    fn test_extension_creates_new_type() {
        let mut set = SchemaSet::new();
        let ext_doc = parse_schema_document(
            "extend type NewType { field: String }",
            SourceLocationKey::generated(),
        )
        .unwrap();
        set.merge_sdl_document(&ext_doc, true).unwrap();
        assert!(set.types.contains_key(&"NewType".intern()));
    }

    // --- Object with interfaces ---

    #[test]
    fn test_object_with_interfaces_to_set_definition() {
        let set = set_from_sdl(indoc! {r#"
            interface Node { id: ID! }
            type User implements Node { id: ID! }
        "#});
        if let SetType::Object(obj) = set.types.get(&"User".intern()).unwrap() {
            assert!(
                obj.interfaces.contains_key(&"Node".intern()),
                "User should implement Node"
            );
        } else {
            panic!("Expected Object type");
        }
    }

    // --- Extension adds interface ---

    #[test]
    fn test_extension_adds_interface() {
        let mut set = SchemaSet::new();
        let base =
            parse_schema_document("type Foo { id: ID! }", SourceLocationKey::generated()).unwrap();
        set.merge_sdl_document(&base, false).unwrap();

        let ext = parse_schema_document(
            "extend type Foo implements Bar",
            SourceLocationKey::generated(),
        )
        .unwrap();
        set.merge_sdl_document(&ext, true).unwrap();

        if let SetType::Object(obj) = set.types.get(&"Foo".intern()).unwrap() {
            assert!(
                obj.interfaces.contains_key(&"Bar".intern()),
                "Extension should add Bar interface"
            );
        } else {
            panic!("Expected Object type");
        }
    }
}
