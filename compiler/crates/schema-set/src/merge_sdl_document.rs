/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::BTreeMap;
use std::collections::VecDeque;

use common::ArgumentName;
use common::DirectiveName;
use common::EnumName;
use common::InputObjectName;
use common::InterfaceName;
use common::NamedItem;
use common::ObjectName;
use common::ScalarName;
use common::SourceLocationKey;
use common::UnionName;
use common::WithLocation;
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
use schema::ArgumentValue;
use schema::DirectiveValue;
use schema::EnumValue;
use schema::TypeReference;

use crate::OutputNonNull;
use crate::OutputTypeReference;
use crate::SEMANTIC_NON_NULL;
use crate::SEMANTIC_NON_NULL_LEVELS_ARG;
use crate::schema_set::FieldName;
use crate::schema_set::SchemaDefinitionItem;
use crate::schema_set::SetArgument;
use crate::schema_set::SetDirective;
use crate::schema_set::SetEnum;
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
    fn to_set_definition(&self, source: SourceLocationKey, is_client_definition: bool) -> T;
}

pub fn merge_def_into<
    TypeDef: ToSetDefinition<SetDefinition>,
    SetDefinition: StringKeyNamed + Merges,
>(
    merge_map: &mut StringKeyMap<SetDefinition>,
    type_def: &TypeDef,
    source: SourceLocationKey,
    is_client_definition: bool,
) {
    let merge_type = type_def.to_set_definition(source, is_client_definition);
    let name = merge_type.string_key_name();
    if let Some(exists) = merge_map.get_mut(&name) {
        exists.merge(merge_type);
    } else {
        merge_map.insert(name, merge_type);
    }
}

pub fn merge_ext_into<
    TypeExt: ExtensionIntoDefinition + Clone,
    SetDefinition: StringKeyNamed + Merges,
>(
    used_map: &mut StringKeyMap<SetDefinition>,
    type_ext: &TypeExt,
    source: SourceLocationKey,
) where
    TypeExt::DefinitionType: ToSetDefinition<SetDefinition>,
{
    let set_type = type_ext
        .clone()
        .into_definition()
        // today extensions are ALWAYS client definitions only. However, if there exists a base definition already,
        // this will be a no-op.
        // However, any *fields* we merge in from an extension need to be annotated as being
        // an extension field.
        .to_set_definition(source, true);
    let name = set_type.string_key_name();
    if let Some(exists) = used_map.get_mut(&name) {
        exists.merge(set_type);
    } else {
        used_map.insert(name, set_type);
    }
}

impl ToSetDefinition<SetRootSchema> for SchemaDefinition {
    fn to_set_definition(
        &self,
        _source: SourceLocationKey,
        _is_client_definition: bool,
    ) -> SetRootSchema {
        let mut set_root_schema = SetRootSchema {
            definition: Some(SchemaDefinitionItem {
                name: WithLocation::generated("schema".intern()),
                is_client_definition: false,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: None,
            }),
            directives: build_directive_values(&self.directives),
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
    fn to_set_definition(&self, source: SourceLocationKey, is_client_definition: bool) -> SetType {
        let directives = build_directive_values(&self.directives);
        let values = self.values.as_ref().map_or(BTreeMap::default(), |v| {
            v.items
                .iter()
                .map(|value| {
                    (
                        value.name.value,
                        EnumValue {
                            value: value.name.value,
                            directives: build_directive_values(&value.directives),
                            description: value.description.as_ref().map(|d| d.value),
                        },
                    )
                })
                .collect()
        });
        SetType::Enum(SetEnum {
            definition: Some(SchemaDefinitionItem {
                name: WithLocation::from_span(source, self.name.span, self.name.value),
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
    fn to_set_definition(&self, source: SourceLocationKey, is_client_definition: bool) -> SetType {
        SetType::Interface(SetInterface {
            definition: Some(SchemaDefinitionItem {
                name: WithLocation::from_span(source, self.name.span, self.name.value),
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: None,
            }),
            name: InterfaceName(self.name.value),
            fields: build_fields(self.fields.as_ref(), source, is_client_definition),
            interfaces: build_members(&self.interfaces, is_client_definition),
            directives: build_directive_values(&self.directives),
        })
    }
}

impl ToSetDefinition<SetType> for ObjectTypeDefinition {
    fn to_set_definition(&self, source: SourceLocationKey, is_client_definition: bool) -> SetType {
        SetType::Object(SetObject {
            definition: Some(SchemaDefinitionItem {
                name: WithLocation::from_span(source, self.name.span, self.name.value),
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: None,
            }),
            name: ObjectName(self.name.value),
            fields: build_fields(self.fields.as_ref(), source, is_client_definition),
            interfaces: build_members(&self.interfaces, is_client_definition),
            directives: build_directive_values(&self.directives),
        })
    }
}

impl ToSetDefinition<SetType> for UnionTypeDefinition {
    fn to_set_definition(&self, source: SourceLocationKey, is_client_definition: bool) -> SetType {
        SetType::Union(SetUnion {
            definition: Some(SchemaDefinitionItem {
                name: WithLocation::from_span(source, self.name.span, self.name.value),
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: None,
            }),
            members: build_members(&self.members, is_client_definition),
            name: UnionName(self.name.value),
            directives: build_directive_values(&self.directives),
        })
    }
}

impl ToSetDefinition<SetType> for InputObjectTypeDefinition {
    fn to_set_definition(&self, source: SourceLocationKey, is_client_definition: bool) -> SetType {
        SetType::InputObject(SetInputObject {
            definition: Some(SchemaDefinitionItem {
                name: WithLocation::from_span(source, self.name.span, self.name.value),
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: None,
            }),
            fields: build_argument_values(self.fields.as_ref(), source),
            name: InputObjectName(self.name.value),
            directives: build_directive_values(self.directives.as_ref()),
            fully_recursively_visited: false,
        })
    }
}

impl ToSetDefinition<SetType> for ScalarTypeDefinition {
    fn to_set_definition(&self, source: SourceLocationKey, is_client_definition: bool) -> SetType {
        SetType::Scalar(SetScalar {
            definition: Some(SchemaDefinitionItem {
                name: WithLocation::from_span(source, self.name.span, self.name.value),
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: None,
            }),
            name: ScalarName(self.name.value),
            directives: build_directive_values(self.directives.as_ref()),
        })
    }
}

impl ToSetDefinition<SetDirective> for DirectiveDefinition {
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
    ) -> SetDirective {
        SetDirective {
            definition: Some(SchemaDefinitionItem {
                name: WithLocation::from_span(source, self.name.span, self.name.value),
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: self.hack_source.as_ref().map(|h| h.value),
            }),
            name: DirectiveName(self.name.value),
            arguments: build_argument_values(self.arguments.as_ref(), source),
            locations: self.locations.clone(),
            repeatable: self.repeatable,
        }
    }
}

impl ToSetDefinition<SetField> for FieldDefinition {
    fn to_set_definition(&self, source: SourceLocationKey, is_client_definition: bool) -> SetField {
        SetField {
            definition: Some(SchemaDefinitionItem {
                name: WithLocation::from_span(source, self.name.span, self.name.value),
                is_client_definition,
                description: self.description.as_ref().map(|d| d.value),
                hack_source: self.hack_source.as_ref().map(|h| h.value),
            }),
            name: FieldName(self.name.value),
            arguments: build_argument_values(self.arguments.as_ref(), source),
            type_: build_output_type_reference(&self.type_, &self.directives),
            directives: build_directive_values(&self.directives),
        }
    }
}

impl ToSetDefinition<SetArgument> for InputValueDefinition {
    fn to_set_definition(
        &self,
        source: SourceLocationKey,
        is_client_definition: bool,
    ) -> SetArgument {
        SetArgument {
            definition: Some(SchemaDefinitionItem {
                name: WithLocation::from_span(source, self.name.span, self.name.value),
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
            directives: build_directive_values(&self.directives),
        }
    }
}

// NOTE: copy-pasted this private fn from Relay's in_memory::mod crate.
fn build_directive_values(directives: &[ConstantDirective]) -> Vec<DirectiveValue> {
    directives
        .iter()
        .filter(|d| d.name.value != SEMANTIC_NON_NULL.0)
        .map(|directive| {
            let arguments = if let Some(arguments) = &directive.arguments {
                arguments
                    .items
                    .iter()
                    .map(|argument| ArgumentValue {
                        name: ArgumentName(argument.name.value),
                        value: argument.value.clone(),
                    })
                    .collect()
            } else {
                Vec::new()
            };
            DirectiveValue {
                name: DirectiveName(directive.name.value),
                arguments,
            }
        })
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
            (name, field.to_set_definition(source, is_client_definition))
        })
        .collect()
}

fn build_argument_values(
    arguments: Option<&List<InputValueDefinition>>,
    source: SourceLocationKey,
) -> StringKeyIndexMap<SetArgument> {
    arguments.map_or(StringKeyIndexMap::default(), |args| {
        args.items
            .iter()
            .map(|arg| {
                (
                    arg.name.value,
                    SetArgument {
                        definition: Some(SchemaDefinitionItem {
                            name: WithLocation::from_span(source, arg.name.span, arg.name.value),
                            is_client_definition: false,
                            description: arg.description.as_ref().map(|d| d.value),
                            hack_source: None,
                        }),
                        name: arg.name.value,
                        type_: build_type_reference(&arg.type_),
                        default_value: arg
                            .default_value
                            .as_ref()
                            .map(|default_value| default_value.value.clone()),
                        directives: build_directive_values(&arg.directives),
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
