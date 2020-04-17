/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod flow;

use flow::{print_type, Prop, AST};
use fnv::FnvHashSet;
use graphql_ir::{
    Condition, FragmentDefinition, FragmentSpread, InlineFragment, LinkedField,
    OperationDefinition, ScalarField, Selection,
};
use indexmap::{IndexMap, IndexSet};
use interner::{Intern, StringKey};
use schema::{EnumID, ScalarID, Schema, Type, TypeReference};
use std::fmt::{Result, Write};
use std::hash::Hash;

pub fn generate_fragment_type(fragment: &FragmentDefinition, schema: &Schema) -> String {
    let mut generator = TypeGenerator::new(schema);
    generator.generate_fragment_type(fragment).unwrap();
    generator.result
}

pub fn generate_operation_type(operation: &OperationDefinition, schema: &Schema) -> String {
    let mut generator = TypeGenerator::new(schema);
    generator.generate_operation_type(operation).unwrap();
    generator.result
}

enum GeneratedInputObject {
    Pending,
    Resolved(AST),
}

struct TypeGenerator<'schema> {
    result: String,
    schema: &'schema Schema,
    generated_fragments: FnvHashSet<StringKey>,
    generated_input_object_types: IndexMap<StringKey, GeneratedInputObject>,
    used_enums: FnvHashSet<EnumID>,
    used_fragments: FnvHashSet<StringKey>,
}
impl<'schema> TypeGenerator<'schema> {
    fn new(schema: &'schema Schema) -> Self {
        Self {
            result: String::new(),
            schema,
            generated_fragments: Default::default(),
            generated_input_object_types: Default::default(),
            used_enums: Default::default(),
            used_fragments: Default::default(),
        }
    }

    fn generate_operation_type(&mut self, node: &OperationDefinition) -> Result {
        let input_variables_identifier = format!("{}Variables", node.name.item).intern();
        let response_identifier = format!("{}Response", node.name.item).intern();

        let input_variables_type = self.generate_input_variables_type(node);

        let selections = self.visit_selections(&node.selections);
        let response_type = self.selections_to_babel(selections, false, None);

        self.write_fragment_imports()?;
        self.write_input_object_types()?;
        writeln!(
            self.result,
            "export type {} = {};",
            input_variables_identifier,
            print_type(&input_variables_type)
        )?;
        self.write_enum_definitions()?;
        writeln!(
            self.result,
            "export type {} = {};",
            response_identifier,
            print_type(&response_type)
        )?;

        let operation_types = vec![
            Prop {
                key: "variables".intern(),
                read_only: false,
                other_comment: false,
                optional: false,
                value: AST::Identifier(input_variables_identifier),
            },
            Prop {
                key: "response".intern(),
                read_only: false,
                other_comment: false,
                optional: false,
                value: AST::Identifier(response_identifier),
            },
        ];

        writeln!(
            self.result,
            "export type {} = {};",
            node.name.item,
            print_type(&AST::ExactObject(operation_types))
        )?;
        Ok(())
    }

    fn generate_fragment_type(&mut self, node: &FragmentDefinition) -> Result {
        let selections = self.visit_selections(&node.selections);
        let num_concrete_selections = selections
            .iter()
            .filter(|sel| sel.concrete_type.is_some())
            .count();
        let selections: Vec<_> = selections
            .into_iter()
            .map(|selection| {
                if num_concrete_selections <= 1
                    && selection.is_typename()
                    && !node.type_condition.is_abstract_type()
                {
                    TypeSelection {
                        // concreteType: schema.getTypeString(node.type),
                        concrete_type: Some(node.type_condition),
                        ..selection
                    }
                } else {
                    selection
                }
            })
            .collect();
        self.generated_fragments.insert(node.name.item);

        let ref_type_name = format!("{}$key", node.name.item);
        let ref_type_data_property = Prop {
            key: "$data".intern(),
            optional: true,
            read_only: true,
            other_comment: false,
            value: AST::Identifier(format!("{}$data", node.name.item).intern()),
        };
        let old_fragment_type_name = format!("{}$ref", node.name.item).intern();
        let new_fragment_type_name = format!("{}$fragmentType", node.name.item).intern();
        let ref_type_fragment_ref_property = Prop {
            key: "$fragmentRefs".intern(),
            optional: false,
            read_only: true,
            other_comment: false,
            value: AST::Identifier(old_fragment_type_name),
        };
        let is_plural_fragment = is_plural(node);
        let ref_type =
            AST::InexactObject(vec![ref_type_data_property, ref_type_fragment_ref_property]);

        let data_type_name = format!("{}$data", node.name.item);
        let data_type = node.name.item.lookup();

        let unmasked = false;
        // let unmasked = node.metadata != null && node.metadata.mask === false;

        let base_type = self.selections_to_babel(
            selections,
            unmasked,
            if unmasked {
                None
            } else {
                Some(old_fragment_type_name)
            },
        );
        let type_ = if is_plural_fragment {
            AST::ReadOnlyArray(base_type.into())
        } else {
            base_type
        };
        self.write_fragment_imports()?;
        self.write_enum_definitions()?;
        writeln!(
            self.result,
            "import type {{ FragmentReference }} from \"relay-runtime\";"
        )?;

        writeln!(
            self.result,
            "declare export opaque type {}: FragmentReference;",
            old_fragment_type_name
        )?;
        writeln!(
            self.result,
            "declare export opaque type {}: {};",
            new_fragment_type_name, old_fragment_type_name
        )?;
        writeln!(
            self.result,
            "export type {} = {};",
            node.name.item,
            print_type(&type_)
        )?;
        writeln!(
            self.result,
            "export type {} = {};",
            data_type_name, data_type
        )?;
        writeln!(
            self.result,
            "export type {} = {};",
            ref_type_name,
            print_type(&ref_type)
        )?;

        Ok(())
    }

    fn visit_selections(&mut self, selections: &[Selection]) -> Vec<TypeSelection> {
        let mut type_selections = Vec::new();
        for selection in selections {
            match selection {
                Selection::FragmentSpread(fragment_spread) => {
                    self.visit_fragment_spread(&mut type_selections, fragment_spread)
                }
                Selection::InlineFragment(inline_fragment) => {
                    self.visit_inline_fragment(&mut type_selections, inline_fragment)
                }
                Selection::LinkedField(linked_field) => {
                    self.visit_linked_field(&mut type_selections, linked_field)
                }
                Selection::ScalarField(scalar_field) => {
                    self.visit_scalar_field(&mut type_selections, scalar_field)
                }
                Selection::Condition(condition) => {
                    self.visit_condition(&mut type_selections, condition)
                }
            }
        }
        type_selections
    }

    fn visit_fragment_spread(
        &mut self,
        type_selections: &mut Vec<TypeSelection>,
        fragment_spread: &FragmentSpread,
    ) {
        let name = fragment_spread.fragment.item;
        self.used_fragments.insert(name);
        type_selections.push(TypeSelection {
            key: format!("__fragments_{}", name).intern(),
            schema_name: None,
            conditional: false,
            value: None,
            node_type: None,
            concrete_type: None,
            ref_: Some(name),
            node_selections: None,
            document_name: None,
            kind: None,
        });
    }

    fn visit_inline_fragment(
        &mut self,
        type_selections: &mut Vec<TypeSelection>,
        inline_fragment: &InlineFragment,
    ) {
        let mut selections = self.visit_selections(&inline_fragment.selections);
        if let Some(type_condition) = inline_fragment.type_condition {
            for selection in selections.iter_mut() {
                if type_condition.is_abstract_type() {
                    selection.conditional = true;
                } else {
                    selection.concrete_type = Some(type_condition);
                }
            }
        }
        type_selections.append(&mut selections);
    }

    fn visit_linked_field(
        &mut self,
        type_selections: &mut Vec<TypeSelection>,
        linked_field: &LinkedField,
    ) {
        let field = self.schema.field(linked_field.definition.item);
        let schema_name = field.name;
        let key = if let Some(alias) = linked_field.alias {
            alias.item
        } else {
            schema_name
        };
        let selections = self.visit_selections(&linked_field.selections);
        type_selections.push(TypeSelection {
            key,
            schema_name: Some(schema_name),
            node_type: Some(field.type_.clone()),
            value: None,
            conditional: false,
            concrete_type: None,
            ref_: None,
            node_selections: Some(selections_to_map(&self.schema, selections, true)),
            kind: None,
            document_name: None,
        });
    }

    fn visit_scalar_field(
        &mut self,
        type_selections: &mut Vec<TypeSelection>,
        scalar_field: &ScalarField,
    ) {
        let field = self.schema.field(scalar_field.definition.item);
        let schema_name = field.name;
        let key = if let Some(alias) = scalar_field.alias {
            alias.item
        } else {
            schema_name
        };
        type_selections.push(TypeSelection {
            key,
            schema_name: Some(schema_name),
            node_type: None,
            value: Some(self.transform_scalar_type(&field.type_, None)),
            conditional: false,
            concrete_type: None,
            ref_: None,
            node_selections: None,
            kind: None,
            document_name: None,
        });
    }

    fn visit_condition(&mut self, type_selections: &mut Vec<TypeSelection>, condition: &Condition) {
        let mut selections = self.visit_selections(&condition.selections);
        for selection in selections.iter_mut() {
            selection.conditional = true;
        }
        type_selections.append(&mut selections);
    }

    fn selections_to_babel(
        &mut self,
        selections: Vec<TypeSelection>,
        unmasked: bool,
        fragment_type_name: Option<StringKey>,
    ) -> AST {
        let mut base_fields: TypeSelectionMap = Default::default();
        let mut by_concrete_type: IndexMap<Type, Vec<TypeSelection>> = Default::default();

        for selection in selections {
            if let Some(concrete_type) = selection.concrete_type {
                by_concrete_type
                    .entry(concrete_type)
                    .or_insert_with(Vec::new)
                    .push(selection);
            } else {
                let next_sel = if let Some(previous_sel) = base_fields.get(&selection.key) {
                    merge_selection(Some(selection), previous_sel.clone(), true)
                } else {
                    selection
                };
                base_fields.insert(next_sel.key, next_sel);
            }
        }

        let mut types: Vec<Vec<Prop>> = Vec::new();

        fn has_typename_selection(selections: &Vec<TypeSelection>) -> bool {
            selections.iter().any(TypeSelection::is_typename)
        }

        if !by_concrete_type.is_empty()
            && base_fields.values().all(TypeSelection::is_typename)
            && (base_fields.values().any(TypeSelection::is_typename)
                || by_concrete_type.values().all(has_typename_selection))
        {
            let mut typename_aliases = IndexSet::new();
            for (concrete_type, selections) in by_concrete_type {
                types.push(
                    group_refs(
                        base_fields
                            .iter()
                            .map(|(_, v)| v.clone())
                            .chain(selections.into_iter())
                            .collect(),
                    )
                    .into_iter()
                    .map(|selection| {
                        if selection.is_typename() {
                            typename_aliases.insert(selection.key);
                        }
                        self.make_prop(selection, unmasked, Some(concrete_type))
                    })
                    .collect(),
                );
            }

            // It might be some other type then the listed concrete types. Ideally, we
            // would set the type to diff(string, set of listed concrete types), but
            // this doesn't exist in Flow at the time.
            types.push(
                typename_aliases
                    .iter()
                    .map(|typename_alias| Prop {
                        key: *typename_alias,
                        read_only: true,
                        optional: false,
                        other_comment: true,
                        value: AST::StringLiteral("%other".intern()),
                    })
                    .collect(),
            );
        } else {
            let mut selection_map =
                selections_to_map(&self.schema, hashmap_into_value_vec(base_fields), false);
            for concrete_type_selections in by_concrete_type.values() {
                selection_map = merge_selections(
                    selection_map,
                    selections_to_map(
                        &self.schema,
                        concrete_type_selections
                            .iter()
                            .map(|sel| TypeSelection {
                                conditional: true,
                                ..sel.clone()
                            })
                            .collect(),
                        false,
                    ),
                    true,
                )
            }
            let selection_map_values = group_refs(hashmap_into_value_vec(selection_map))
                .into_iter()
                .map(|sel| {
                    if sel.is_typename() && sel.concrete_type.is_some() {
                        self.make_prop(
                            TypeSelection {
                                conditional: false,
                                ..sel
                            },
                            unmasked,
                            sel.concrete_type,
                        )
                    } else {
                        self.make_prop(sel, unmasked, None)
                    }
                })
                .collect();
            types.push(selection_map_values);
        }

        AST::Union(
            types
                .into_iter()
                .map(|mut props: Vec<Prop>| {
                    if let Some(fragment_type_name) = fragment_type_name {
                        props.push(Prop {
                            key: "$refType".intern(),
                            optional: false,
                            read_only: true,
                            other_comment: false,
                            value: AST::Identifier(fragment_type_name),
                        });
                    }
                    if unmasked {
                        AST::InexactObject(props)
                    } else {
                        AST::ExactObject(props)
                    }
                })
                .collect(),
        )
    }

    fn make_prop(
        &mut self,
        type_selection: TypeSelection,
        unmasked: bool,
        concrete_type: Option<Type>,
    ) -> Prop {
        let TypeSelection {
            key,
            schema_name,
            value,
            conditional,
            node_type,
            node_selections,
            ..
        } = type_selection;
        let value = if let Some(node_type) = node_type {
            let object_props = self.selections_to_babel(
                hashmap_into_value_vec(node_selections.unwrap()),
                unmasked,
                None,
            );
            self.transform_scalar_type(&node_type, Some(object_props))
        } else if schema_name == Some("__typename".intern()) {
            if let Some(concrete_type) = concrete_type {
                AST::StringLiteral(self.schema.get_type_name(concrete_type))
            } else {
                value.unwrap()
            }
        } else {
            value.unwrap()
        };
        Prop {
            key,
            read_only: true,
            optional: conditional,
            other_comment: false,
            value,
        }
    }

    fn transform_scalar_type(
        &mut self,
        type_reference: &TypeReference,
        object_props: Option<AST>,
    ) -> AST {
        match type_reference {
            TypeReference::NonNull(non_null_ref) => {
                self.transform_non_nullable_scalar_type(&(*non_null_ref), object_props)
            }
            _ => AST::Nullable(Box::new(
                self.transform_non_nullable_scalar_type(type_reference, object_props),
            )),
        }
    }

    fn transform_non_nullable_scalar_type(
        &mut self,
        type_reference: &TypeReference,
        object_props: Option<AST>,
    ) -> AST {
        match type_reference {
            TypeReference::List(of_type) => {
                AST::ReadOnlyArray(Box::new(self.transform_scalar_type(of_type, object_props)))
            }
            TypeReference::Named(named_type) => match named_type {
                Type::Object(_) | Type::Union(_) | Type::Interface(_) => object_props.unwrap(),
                Type::Scalar(scalar_id) => self.transform_graphql_scalar_type(*scalar_id),
                Type::Enum(enum_id) => self.transform_graphql_enum_type(*enum_id),
                _ => panic!(),
            },
            TypeReference::NonNull(_) => panic!("unexpected NonNull"),
        }
    }

    fn transform_graphql_scalar_type(&mut self, scalar: ScalarID) -> AST {
        // const customType = state.customScalars[typeName];
        // if (typeof customType === 'function') {
        //   return customType(t);
        // }
        // switch (customType ?? typeName) {
        //   case 'ID':
        //   case 'String':
        //     return t.stringTypeAnnotation();
        //   case 'Float':
        //   case 'Int':
        //     return t.numberTypeAnnotation();
        //   case 'Boolean':
        //     return t.booleanTypeAnnotation();
        //   default:
        //     return customType == null
        //       ? t.anyTypeAnnotation()
        //       : t.genericTypeAnnotation(t.identifier(customType));
        // }

        let scalar_name = self.schema.scalar(scalar).name;
        if scalar_name == "ID".intern() || scalar_name == "String".intern() {
            AST::String
        } else if scalar_name == "Float".intern() || scalar_name == "Int".intern() {
            AST::Number
        } else if scalar_name == "Boolean".intern() {
            AST::Boolean
        } else if scalar_name == "Url".intern() {
            // TODO make custom scalars configurable
            AST::String
        } else {
            AST::Any
        }
    }

    fn transform_graphql_enum_type(&mut self, enum_id: EnumID) -> AST {
        self.used_enums.insert(enum_id);
        AST::Identifier(self.schema.enum_(enum_id).name)
    }

    fn write_fragment_imports(&mut self) -> Result {
        let mut used_fragments: Vec<_> = self.used_fragments.iter().collect();
        used_fragments.sort();
        for used_fragment in used_fragments {
            let fragment_type_name = get_old_fragment_type_name(*used_fragment);
            if !self.generated_fragments.contains(used_fragment) {
                //   if (state.useHaste) {
                //     // TODO(T22653277) support non-haste environments when importing
                //     // fragments
                writeln!(
                    self.result,
                    "import type {{ {} }} from \"{}.graphql\";",
                    fragment_type_name, used_fragment
                )?;
                //   } else if (state.useSingleArtifactDirectory) {
                //     imports.push(
                //       importTypes([fragmentTypeName], './' + usedFragment + '.graphql'),
                //     );
                //   } else {
                //     imports.push(anyTypeAlias(fragmentTypeName));
                //   }
            }
        }
        Ok(())
    }

    fn write_enum_definitions(&mut self) -> Result {
        let mut enum_ids: Vec<_> = self.used_enums.iter().cloned().collect();
        enum_ids.sort_by_key(|enum_id| self.schema.enum_(*enum_id).name);
        for enum_id in enum_ids {
            let enum_type = self.schema.enum_(enum_id);
            let mut members: Vec<AST> = enum_type
                .values
                .iter()
                .map(|enum_value| AST::StringLiteral(*enum_value))
                .collect();
            members.push(AST::StringLiteral("%future added value".intern()));
            writeln!(
                self.result,
                "export type {} = {};",
                enum_type.name,
                print_type(&AST::Union(members))
            )?;
        }
        Ok(())
    }

    fn generate_input_variables_type(&mut self, node: &OperationDefinition) -> AST {
        AST::ExactObject(
            node.variable_definitions
                .iter()
                .map(|var_def| Prop {
                    key: var_def.name.item,
                    read_only: false,
                    optional: !var_def.type_.is_non_null(),
                    other_comment: false,
                    value: self.transform_input_type(&var_def.type_),
                })
                .collect(),
        )
    }

    fn write_input_object_types(&mut self) -> Result {
        for (type_identifier, input_object_type) in self.generated_input_object_types.iter() {
            match input_object_type {
                GeneratedInputObject::Resolved(input_object_type) => {
                    writeln!(
                        self.result,
                        "export type {} = {};",
                        type_identifier,
                        print_type(&input_object_type)
                    )?;
                }
                GeneratedInputObject::Pending => panic!("expected a resolved type here"),
            }
        }
        Ok(())
    }

    fn transform_input_type(&mut self, type_ref: &TypeReference) -> AST {
        match type_ref {
            TypeReference::NonNull(of_type) => self.transform_non_nullable_input_type(of_type),
            _ => AST::Nullable(Box::new(self.transform_non_nullable_input_type(type_ref))),
        }
    }

    fn transform_non_nullable_input_type(&mut self, type_ref: &TypeReference) -> AST {
        match type_ref {
            TypeReference::List(of_type) => {
                AST::ReadOnlyArray(Box::new(self.transform_input_type(of_type)))
            }
            TypeReference::Named(named_type) => match named_type {
                Type::Scalar(scalar) => self.transform_graphql_scalar_type(*scalar),
                Type::Enum(_enum) => AST::TODO("Enum".to_string()),
                Type::InputObject(input_object_id) => {
                    let input_object = self.schema.input_object(*input_object_id);
                    if !self
                        .generated_input_object_types
                        .contains_key(&input_object.name)
                    {
                        self.generated_input_object_types
                            .insert(input_object.name, GeneratedInputObject::Pending);

                        let props = input_object
                            .fields
                            .iter()
                            .map(|field| Prop {
                                key: field.name,
                                read_only: false,
                                optional: !field.type_.is_non_null(),
                                other_comment: false,
                                value: self.transform_input_type(&field.type_),
                            })
                            .collect();
                        self.generated_input_object_types.insert(
                            input_object.name,
                            GeneratedInputObject::Resolved(AST::ExactObject(props)),
                        );
                    }
                    AST::Identifier(input_object.name)
                }
                Type::Union(_) | Type::Object(_) | Type::Interface(_) => {
                    panic!("unexpected non-input type")
                }
            },
            TypeReference::NonNull(_) => panic!("Unexpected NonNull"),
        }
    }
}

#[derive(Debug, Clone)]
struct TypeSelection {
    key: StringKey,
    schema_name: Option<StringKey>,
    value: Option<AST>,
    node_type: Option<TypeReference>,
    conditional: bool,
    concrete_type: Option<Type>,
    ref_: Option<StringKey>,
    node_selections: Option<TypeSelectionMap>,
    kind: Option<StringKey>,
    document_name: Option<StringKey>,
}
impl TypeSelection {
    fn is_typename(&self) -> bool {
        if let Some(schema_name) = self.schema_name {
            schema_name == "__typename".intern()
        } else {
            false
        }
    }
}

type TypeSelectionMap = IndexMap<StringKey, TypeSelection>;

fn merge_selection(
    a: Option<TypeSelection>,
    mut b: TypeSelection,
    should_set_conditional: bool,
) -> TypeSelection {
    if let Some(a) = a {
        let conditional = a.conditional && b.conditional;
        TypeSelection {
            node_selections: a.node_selections.map(|a_node_selections| {
                merge_selections(
                    a_node_selections,
                    b.node_selections.unwrap(),
                    should_set_conditional,
                )
            }),
            conditional,
            ..a
        }
    } else if should_set_conditional {
        b.conditional = true;
        b
    } else {
        b
    }
}

fn merge_selections(
    a: TypeSelectionMap,
    b: TypeSelectionMap,
    should_set_conditional: bool,
) -> TypeSelectionMap {
    let mut merged: TypeSelectionMap = Default::default();
    merged.extend(a);
    for (key, value) in b {
        merged.insert(
            key,
            merge_selection(merged.get(&key).cloned(), value, should_set_conditional),
        );
    }
    merged
}

fn is_plural(_node: &FragmentDefinition) -> bool {
    // TODO: return Boolean(node.metadata && node.metadata.plural);
    false
}

fn selections_to_map(
    schema: &Schema,
    selections: Vec<TypeSelection>,
    append_type: bool,
) -> TypeSelectionMap {
    let mut map: TypeSelectionMap = Default::default();
    for selection in selections {
        let key = if append_type {
            if let Some(concrete_type) = selection.concrete_type {
                format!("{}::{}", selection.key, schema.get_type_name(concrete_type)).intern()
            } else {
                selection.key
            }
        } else {
            selection.key
        };

        map.insert(
            key,
            if let Some(previous_sel) = map.get(&key) {
                merge_selection(Some(previous_sel.clone()), selection, true)
            } else {
                selection
            },
        );
    }
    map
}

fn group_refs(props: Vec<TypeSelection>) -> Vec<TypeSelection> {
    let mut result = Vec::new();
    let mut refs = Vec::new();
    for prop in props {
        if let Some(ref_) = prop.ref_ {
            refs.push(ref_);
        } else {
            result.push(prop);
        }
    }
    if !refs.is_empty() {
        let value = AST::Intersection(
            refs.into_iter()
                .map(|ref_| AST::Identifier(get_old_fragment_type_name(ref_)))
                .collect(),
        );
        result.push(TypeSelection {
            key: "$fragmentRefs".intern(),
            conditional: false,
            value: Some(value),
            schema_name: None,
            node_type: None,
            concrete_type: None,
            ref_: None,
            node_selections: None,
            kind: None,
            document_name: None,
        });
    }
    result
}

fn hashmap_into_value_vec<K: Hash + Eq, V>(map: IndexMap<K, V>) -> Vec<V> {
    map.into_iter().map(|(_, val)| val).collect()
}

fn get_old_fragment_type_name(name: StringKey) -> StringKey {
    format!("{}$ref", name).intern()
}
