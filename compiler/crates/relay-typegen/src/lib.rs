/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod config;
mod flow;
mod typescript;
mod writer;

use crate::flow::FlowPrinter;
use crate::typescript::TypeScriptPrinter;
use crate::writer::Writer;
use common::NamedItem;
pub use config::{TypegenConfig, TypegenLanguage};
use fnv::FnvHashSet;
use graphql_ir::{
    Condition, Directive, FragmentDefinition, FragmentSpread, InlineFragment, LinkedField,
    OperationDefinition, ScalarField, Selection,
};
use indexmap::{map::Entry, IndexMap, IndexSet};
use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use relay_transforms::{
    extract_refetch_metadata_from_directive, RefetchableDerivedFromMetadata, RelayDirective,
    CHILDREN_CAN_BUBBLE_METADATA_KEY, CLIENT_EXTENSION_DIRECTIVE_NAME, MATCH_CONSTANTS,
    REQUIRED_METADATA_KEY,
};
use schema::{EnumID, ScalarID, Schema, Type, TypeReference};
use std::fmt::{Result, Write};
use std::hash::Hash;
use writer::{Prop, AST, SPREAD_KEY};

lazy_static! {
    static ref RAW_RESPONSE_TYPE_DIRECTIVE_NAME: StringKey = "raw_response_type".intern();
    static ref KEY_RAW_RESPONSE: StringKey = "rawResponse".intern();
    static ref FRAGMENT_PROP_NAME: StringKey = "__fragmentPropName".intern();
    static ref MODULE_COMPONENT: StringKey = "__module_component".intern();
    static ref VARIABLES: StringKey = "variables".intern();
    static ref RESPONSE: StringKey = "response".intern();
    static ref KEY_DATA: StringKey = "$data".intern();
    static ref KEY_REF_TYPE: StringKey = "$refType".intern();
    static ref KEY_FRAGMENT_REFS: StringKey = "$fragmentRefs".intern();
    static ref KEY_TYPENAME: StringKey = "__typename".intern();
    static ref TYPE_ID: StringKey = "ID".intern();
    static ref TYPE_STRING: StringKey = "String".intern();
    static ref TYPE_FLOAT: StringKey = "Float".intern();
    static ref TYPE_INT: StringKey = "Int".intern();
    static ref TYPE_BOOLEAN: StringKey = "Boolean".intern();
    static ref FUTURE_ENUM_VALUE: StringKey = "%future added value".intern();
    static ref JS_FIELD_NAME: StringKey = "js".intern();
}

pub fn generate_fragment_type(
    fragment: &FragmentDefinition,
    schema: &Schema,
    typegen_config: &TypegenConfig,
) -> String {
    let mut generator = TypeGenerator::new(schema, typegen_config);
    generator.generate_fragment_type(fragment).unwrap();
    generator.result
}

pub fn generate_operation_type(
    typegen_operation: &OperationDefinition,
    normalization_operation: &OperationDefinition,
    schema: &Schema,
    typegen_config: &TypegenConfig,
) -> String {
    let mut generator = TypeGenerator::new(schema, typegen_config);
    generator
        .generate_operation_type(typegen_operation, normalization_operation)
        .unwrap();
    generator.result
}

enum GeneratedInputObject {
    Pending,
    Resolved(AST),
}

#[derive(Default)]
struct RuntimeImports {
    local_3d_payload: bool,
    fragment_reference: bool,
}

struct TypeGenerator<'schema, 'config> {
    result: String,
    schema: &'schema Schema,
    generated_fragments: FnvHashSet<StringKey>,
    generated_input_object_types: IndexMap<StringKey, GeneratedInputObject>,
    used_enums: FnvHashSet<EnumID>,
    used_fragments: FnvHashSet<StringKey>,
    typegen_config: &'config TypegenConfig,
    runtime_imports: RuntimeImports,
    match_fields: IndexMap<StringKey, AST>,
    writer: Box<dyn Writer>,
}
impl<'schema, 'config> TypeGenerator<'schema, 'config> {
    fn new(schema: &'schema Schema, typegen_config: &'config TypegenConfig) -> Self {
        Self {
            result: String::new(),
            schema,
            generated_fragments: Default::default(),
            generated_input_object_types: Default::default(),
            used_enums: Default::default(),
            used_fragments: Default::default(),
            typegen_config,
            match_fields: Default::default(),
            runtime_imports: RuntimeImports::default(),
            writer: Self::create_writer(typegen_config),
        }
    }

    fn create_writer(typegen_config: &TypegenConfig) -> Box<dyn Writer> {
        match &typegen_config.language {
            TypegenLanguage::Flow => Box::new(FlowPrinter::new()),
            TypegenLanguage::TypeScript => Box::new(TypeScriptPrinter::new()),
        }
    }

    fn generate_operation_type(
        &mut self,
        typegen_operation: &OperationDefinition,
        normalization_operation: &OperationDefinition,
    ) -> Result {
        let input_variables_identifier =
            format!("{}Variables", typegen_operation.name.item).intern();
        let response_identifier = format!("{}Response", typegen_operation.name.item).intern();

        let input_variables_type = self.generate_input_variables_type(typegen_operation);

        let selections = self.visit_selections(&typegen_operation.selections);
        let mut response_type = self.selections_to_babel(selections, false, None);

        response_type = match typegen_operation
            .directives
            .named(*CHILDREN_CAN_BUBBLE_METADATA_KEY)
        {
            Some(_) => AST::Nullable(response_type.into()),
            None => response_type,
        };

        let raw_response_type = if has_raw_response_type_directive(normalization_operation) {
            let raw_response_selections =
                self.raw_response_visit_selections(&normalization_operation.selections);
            Some(self.raw_response_selections_to_babel(raw_response_selections, None))
        } else {
            None
        };

        let refetchable_fragment_name =
            RefetchableDerivedFromMetadata::from_directives(&typegen_operation.directives);
        if refetchable_fragment_name.is_some() {
            self.runtime_imports.fragment_reference = true;
        }

        self.write_runtime_imports()?;
        if let Some(refetchable_fragment_name) = refetchable_fragment_name {
            self.write_fragment_refs_for_refetchable(refetchable_fragment_name)?;
        } else {
            self.write_fragment_imports()?;
        }
        self.write_enum_definitions()?;
        self.write_input_object_types()?;
        writeln!(
            self.result,
            "{}",
            self.writer.write_ast(&AST::ExportTypeEquals(
                input_variables_identifier,
                Box::from(input_variables_type)
            ))
        )?;
        writeln!(
            self.result,
            "{}",
            self.writer.write_ast(&AST::ExportTypeEquals(
                response_identifier,
                Box::from(response_type)
            )),
        )?;

        let mut operation_types = vec![
            Prop {
                key: *VARIABLES,
                read_only: false,
                optional: false,
                value: AST::Identifier(input_variables_identifier),
            },
            Prop {
                key: *RESPONSE,
                read_only: false,
                optional: false,
                value: AST::Identifier(response_identifier),
            },
        ];

        if let Some(raw_response_type) = raw_response_type {
            for (key, ast) in self.match_fields.iter() {
                writeln!(
                    self.result,
                    "{}",
                    self.writer
                        .write_ast(&AST::ExportTypeEquals(*key, Box::from(ast.clone())))
                )?;
            }
            let raw_response_identifier =
                format!("{}RawResponse", typegen_operation.name.item).intern();
            writeln!(
                self.result,
                "{}",
                self.writer.write_ast(&AST::ExportTypeEquals(
                    raw_response_identifier,
                    Box::from(raw_response_type)
                ))
            )?;
            operation_types.push(Prop {
                key: *KEY_RAW_RESPONSE,
                read_only: false,
                optional: false,
                value: AST::Identifier(raw_response_identifier),
            })
        }

        writeln!(
            self.result,
            "{}",
            self.writer.write_ast(&AST::ExportTypeEquals(
                typegen_operation.name.item,
                Box::from(AST::ExactObject(operation_types))
            ))
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
            key: *KEY_DATA,
            optional: true,
            read_only: true,
            value: AST::Identifier(format!("{}$data", node.name.item).intern()),
        };
        let old_fragment_type_name = format!("{}$ref", node.name.item).intern();
        let new_fragment_type_name = format!("{}$fragmentType", node.name.item).intern();
        let ref_type_fragment_ref_property = Prop {
            key: *KEY_FRAGMENT_REFS,
            optional: false,
            read_only: true,
            value: AST::Identifier(old_fragment_type_name),
        };
        let is_plural_fragment = is_plural(node);
        let mut ref_type =
            AST::InexactObject(vec![ref_type_data_property, ref_type_fragment_ref_property]);
        if is_plural_fragment {
            ref_type = AST::ReadOnlyArray(Box::new(ref_type));
        }

        let data_type_name = format!("{}$data", node.name.item);
        let data_type = node.name.item.lookup();

        let unmasked = RelayDirective::is_unmasked_fragment_definition(&node);

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

        let type_ = match node.directives.named(*CHILDREN_CAN_BUBBLE_METADATA_KEY) {
            Some(_) => AST::Nullable(type_.into()),
            None => type_,
        };

        self.runtime_imports.fragment_reference = true;
        self.write_fragment_imports()?;
        self.write_enum_definitions()?;
        self.write_runtime_imports()?;

        let refetchable_metadata = extract_refetch_metadata_from_directive(&node.directives);
        if let Some(refetchable_metadata) = refetchable_metadata {
            writeln!(
                self.result,
                "{}",
                self.writer.write_ast(&AST::ImportType(
                    vec![old_fragment_type_name, new_fragment_type_name],
                    format!("{}.graphql", refetchable_metadata.operation_name).intern()
                ))
            )?;
            writeln!(
                self.result,
                "{}",
                self.writer.write_ast(&AST::ExportList(vec![
                    old_fragment_type_name,
                    new_fragment_type_name
                ]))
            )?;
        } else {
            writeln!(
                self.result,
                "{}",
                self.writer.write_ast(&AST::DeclareExportOpaqueType(
                    old_fragment_type_name,
                    "FragmentReference".intern()
                ))
            )?;
            writeln!(
                self.result,
                "{}",
                self.writer.write_ast(&AST::DeclareExportOpaqueType(
                    new_fragment_type_name,
                    old_fragment_type_name
                ))
            )?;
        }
        writeln!(
            self.result,
            "{}",
            self.writer
                .write_ast(&AST::ExportTypeEquals(node.name.item, Box::from(type_)))
        )?;
        writeln!(
            self.result,
            "{}",
            self.writer.write_ast(&AST::ExportTypeEquals(
                data_type_name.intern(),
                Box::from(AST::RawType(data_type.intern()))
            ))
        )?;
        writeln!(
            self.result,
            "{}",
            self.writer.write_ast(&AST::ExportTypeEquals(
                ref_type_name.intern(),
                Box::from(ref_type)
            ))
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
                Selection::LinkedField(linked_field) => self.gen_visit_linked_field(
                    &mut type_selections,
                    linked_field,
                    Self::visit_selections,
                ),
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
        });
    }

    fn visit_inline_fragment(
        &mut self,
        type_selections: &mut Vec<TypeSelection>,
        inline_fragment: &InlineFragment,
    ) {
        if let Some(module_directive) = inline_fragment
            .directives
            .named(MATCH_CONSTANTS.custom_module_directive_name)
        {
            let name = module_directive
                .arguments
                .named(MATCH_CONSTANTS.name_arg)
                .unwrap()
                .value
                .item
                .expect_string_literal();
            type_selections.push(TypeSelection {
                key: *FRAGMENT_PROP_NAME,
                schema_name: None,
                value: Some(AST::Nullable(Box::new(AST::String))),
                node_type: None,
                conditional: true,
                concrete_type: None,
                ref_: None,
                node_selections: None,
                document_name: None,
            });
            type_selections.push(TypeSelection {
                key: *MODULE_COMPONENT,
                schema_name: None,
                value: Some(AST::Nullable(Box::new(AST::String))),
                node_type: None,
                conditional: true,
                concrete_type: None,
                ref_: None,
                node_selections: None,
                document_name: None,
            });
            self.used_fragments.insert(name);
            type_selections.push(TypeSelection {
                key: format!("__fragments_{}", name).intern(),
                schema_name: None,
                value: None,
                node_type: None,
                conditional: false,
                concrete_type: None,
                ref_: Some(name),
                node_selections: None,
                document_name: None,
            });
            return;
        }
        let mut selections = self.visit_selections(&inline_fragment.selections);
        if let Some(type_condition) = inline_fragment.type_condition {
            for selection in &mut selections {
                if type_condition.is_abstract_type() {
                    selection.conditional = true;
                } else {
                    selection.concrete_type = Some(type_condition);
                }
            }
        }
        type_selections.append(&mut selections);
    }

    fn raw_response_visit_inline_fragment(
        &mut self,
        type_selections: &mut Vec<TypeSelection>,
        inline_fragment: &InlineFragment,
    ) {
        let mut selections = self.raw_response_visit_selections(&inline_fragment.selections);
        if inline_fragment
            .directives
            .named(*CLIENT_EXTENSION_DIRECTIVE_NAME)
            .is_some()
        {
            for selection in &mut selections {
                selection.conditional = true;
            }
        }

        if let Some(module_directive) = inline_fragment
            .directives
            .named(MATCH_CONSTANTS.custom_module_directive_name)
        {
            let mut module_selections = selections
                .iter()
                .cloned()
                .filter(|sel| sel.schema_name == Some(*JS_FIELD_NAME))
                .collect::<Vec<_>>();
            let directive_arg_name = module_directive
                .arguments
                .named(MATCH_CONSTANTS.name_arg)
                .unwrap()
                .value
                .item
                .expect_string_literal();
            let directive_arg_key = module_directive
                .arguments
                .named(MATCH_CONSTANTS.key_arg)
                .unwrap()
                .value
                .item
                .expect_string_literal();

            /* TODO: Enable this after rolling out
               This causes __typename to be `string`
            if let Some(type_condition) = inline_fragment.type_condition {
                if !type_condition.is_abstract_type() {
                    for selection in &mut selections {
                        selection.concrete_type = Some(type_condition);
                    }
                }
            }
            */

            if !self.match_fields.contains_key(&directive_arg_name) {
                let match_field = self.raw_response_selections_to_babel(
                    selections
                        .iter()
                        .cloned()
                        .filter(|sel| sel.schema_name != Some(*JS_FIELD_NAME))
                        .collect(),
                    None,
                );
                self.match_fields.insert(directive_arg_name, match_field);
            }

            type_selections.append(&mut module_selections);

            type_selections.push(TypeSelection {
                key: directive_arg_name,
                schema_name: None,
                value: None,
                node_type: None,
                conditional: false,
                concrete_type: None,
                ref_: None,
                node_selections: None,
                document_name: Some(directive_arg_key),
            });
            return;
        }
        if let Some(type_condition) = inline_fragment.type_condition {
            if !type_condition.is_abstract_type() {
                for selection in &mut selections {
                    selection.concrete_type = Some(type_condition);
                }
            }
        }
        type_selections.append(&mut selections);
    }

    fn gen_visit_linked_field(
        &mut self,
        type_selections: &mut Vec<TypeSelection>,
        linked_field: &LinkedField,
        mut visit_selections_fn: impl FnMut(&mut Self, &[Selection]) -> Vec<TypeSelection>,
    ) {
        let field = self.schema.field(linked_field.definition.item);
        let schema_name = field.name;
        let key = if let Some(alias) = linked_field.alias {
            alias.item
        } else {
            schema_name
        };
        let selections = visit_selections_fn(self, &linked_field.selections);

        let node_type =
            apply_required_directive_nullability(&field.type_, &linked_field.directives);

        type_selections.push(TypeSelection {
            key,
            schema_name: Some(schema_name),
            node_type: Some(node_type),
            value: None,
            conditional: false,
            concrete_type: None,
            ref_: None,
            node_selections: Some(selections_to_map(selections, true)),
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
        let field_type =
            apply_required_directive_nullability(&field.type_, &scalar_field.directives);
        type_selections.push(TypeSelection {
            key,
            schema_name: Some(schema_name),
            node_type: None,
            value: Some(self.transform_scalar_type(&field_type, None)),
            conditional: false,
            concrete_type: None,
            ref_: None,
            node_selections: None,
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
                let key = TypeSelectionKey {
                    key: selection.key,
                    concrete_type: None,
                };
                match base_fields.entry(key) {
                    Entry::Occupied(entry) => {
                        let previous_sel = entry.get().clone();
                        *entry.into_mut() = merge_selection(Some(selection), previous_sel, true);
                    }
                    Entry::Vacant(entry) => {
                        entry.insert(selection);
                    }
                }
            }
        }

        let mut types: Vec<Vec<Prop>> = Vec::new();

        #[allow(clippy::ptr_arg)]
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
                        value: AST::OtherEnumValue,
                    })
                    .collect(),
            );
        } else {
            let mut selection_map = selections_to_map(hashmap_into_value_vec(base_fields), false);
            for concrete_type_selections in by_concrete_type.values() {
                selection_map = merge_selections(
                    selection_map,
                    selections_to_map(
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
                            key: *KEY_REF_TYPE,
                            optional: false,
                            read_only: true,
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

    fn raw_response_selections_to_babel(
        &mut self,
        selections: Vec<TypeSelection>,
        concrete_type: Option<Type>,
    ) -> AST {
        let mut base_fields = Vec::new();
        let mut by_concrete_type: IndexMap<Type, Vec<TypeSelection>> = Default::default();

        for selection in selections {
            if let Some(concrete_type) = selection.concrete_type {
                by_concrete_type
                    .entry(concrete_type)
                    .or_insert_with(Vec::new)
                    .push(selection);
            } else {
                base_fields.push(selection);
            }
        }

        let mut types: Vec<AST> = Vec::new();

        if !by_concrete_type.is_empty() {
            let base_fields_map = selections_to_map(base_fields.clone(), false);
            for (concrete_type, selections) in by_concrete_type {
                let merged_selections = hashmap_into_value_vec(merge_selections(
                    base_fields_map.clone(),
                    selections_to_map(selections, false),
                    false,
                ));
                types.push(AST::ExactObject(
                    merged_selections
                        .iter()
                        .cloned()
                        .map(|selection| {
                            self.raw_response_make_prop(selection, Some(concrete_type))
                        })
                        .collect(),
                ));
                self.append_local_3d_payload(&mut types, &merged_selections, Some(concrete_type));
            }
        }

        if !base_fields.is_empty() {
            types.push(AST::ExactObject(
                base_fields
                    .iter()
                    .cloned()
                    .map(|selection| self.raw_response_make_prop(selection, concrete_type))
                    .collect(),
            ));
            self.append_local_3d_payload(&mut types, &base_fields, concrete_type);
        }

        AST::Union(types)
    }

    fn append_local_3d_payload(
        &mut self,
        types: &mut Vec<AST>,
        type_selections: &[TypeSelection],
        concrete_type: Option<Type>,
    ) {
        if let Some(module_import) = type_selections
            .iter()
            .find(|sel| sel.document_name.is_some())
        {
            self.runtime_imports.local_3d_payload = true;

            types.push(AST::Local3DPayload(
                module_import.document_name.unwrap(),
                Box::new(AST::ExactObject(
                    type_selections
                        .iter()
                        .filter(|sel| sel.schema_name != Some(*JS_FIELD_NAME))
                        .map(|sel| self.raw_response_make_prop(sel.clone(), concrete_type))
                        .collect(),
                )),
            ));
        }
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
        } else if schema_name == Some(*KEY_TYPENAME) {
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
            value,
        }
    }

    fn raw_response_make_prop(
        &mut self,
        type_selection: TypeSelection,
        concrete_type: Option<Type>,
    ) -> Prop {
        let TypeSelection {
            key,
            schema_name,
            value,
            conditional,
            node_type,
            node_selections,
            document_name,
            ..
        } = type_selection;

        if document_name.is_some() {
            return Prop {
                key: *SPREAD_KEY,
                value: AST::Identifier(key),
                read_only: false,
                optional: false,
            };
        }

        let value = if let Some(node_type) = node_type {
            let inner_concrete_type = if node_type.is_list()
                || node_type.is_non_null()
                || node_type.inner().is_abstract_type()
            {
                None
            } else {
                Some(node_type.inner())
            };
            let object_props = self.raw_response_selections_to_babel(
                hashmap_into_value_vec(node_selections.unwrap()),
                inner_concrete_type,
            );
            self.transform_scalar_type(&node_type, Some(object_props))
        } else if schema_name == Some(*KEY_TYPENAME) {
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
        let scalar_name = self.schema.scalar(scalar).name;
        if scalar_name == *TYPE_ID || scalar_name == *TYPE_STRING {
            AST::String
        } else if scalar_name == *TYPE_FLOAT || scalar_name == *TYPE_INT {
            AST::Number
        } else if scalar_name == *TYPE_BOOLEAN {
            AST::Boolean
        } else if let Some(&custom_scalar) =
            self.typegen_config.custom_scalar_types.get(&scalar_name)
        {
            AST::RawType(custom_scalar)
        } else {
            AST::Any
        }
    }

    fn transform_graphql_enum_type(&mut self, enum_id: EnumID) -> AST {
        self.used_enums.insert(enum_id);
        AST::Identifier(self.schema.enum_(enum_id).name)
    }

    fn write_runtime_imports(&mut self) -> Result {
        match self.runtime_imports {
            RuntimeImports {
                local_3d_payload: true,
                fragment_reference: true,
            } => writeln!(
                self.result,
                "{}",
                self.writer.write_ast(&AST::ImportType(
                    vec!["FragmentReference".intern(), "Local3DPayload".intern()],
                    "relay-runtime".intern()
                ))
            ),
            RuntimeImports {
                local_3d_payload: true,
                fragment_reference: false,
            } => writeln!(
                self.result,
                "{}",
                self.writer.write_ast(&AST::ImportType(
                    vec!["Local3DPayload".intern()],
                    "relay-runtime".intern()
                ))
            ),
            RuntimeImports {
                local_3d_payload: false,
                fragment_reference: true,
            } => writeln!(
                self.result,
                "{}",
                self.writer.write_ast(&AST::ImportType(
                    vec!["FragmentReference".intern()],
                    "relay-runtime".intern()
                ))
            ),
            RuntimeImports {
                local_3d_payload: false,
                fragment_reference: false,
            } => Ok(()),
        }
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

    fn write_fragment_refs_for_refetchable(
        &mut self,
        refetchable_fragment_name: StringKey,
    ) -> Result {
        let old_fragment_type_name = format!("{}$ref", refetchable_fragment_name).intern();
        let new_fragment_type_name = format!("{}$fragmentType", refetchable_fragment_name).intern();
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
        Ok(())
    }

    fn write_enum_definitions(&mut self) -> Result {
        let mut enum_ids: Vec<_> = self.used_enums.iter().cloned().collect();
        enum_ids.sort_by_key(|enum_id| self.schema.enum_(*enum_id).name);
        for enum_id in enum_ids {
            let enum_type = self.schema.enum_(enum_id);
            if let Some(enum_module_suffix) = &self.typegen_config.enum_module_suffix {
                writeln!(
                    self.result,
                    "import type {{ {enum_name} }} from \"{enum_name}{enum_suffix}\";",
                    enum_name = enum_type.name,
                    enum_suffix = enum_module_suffix
                )?;
            } else {
                let mut members: Vec<AST> = enum_type
                    .values
                    .iter()
                    .map(|enum_value| AST::StringLiteral(enum_value.value))
                    .collect();
                members.push(AST::StringLiteral(*FUTURE_ENUM_VALUE));
                writeln!(
                    self.result,
                    "export type {} = {};",
                    enum_type.name,
                    self.writer.write_ast(&AST::Union(members))
                )?;
            }
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
                        self.writer.write_ast(&input_object_type)
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
                Type::Enum(enum_id) => self.transform_graphql_enum_type(*enum_id),
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
                                optional: !field.type_.is_non_null()
                                    || self
                                        .typegen_config
                                        .optional_input_fields
                                        .contains(&field.name),
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

    fn raw_response_visit_selections(&mut self, selections: &[Selection]) -> Vec<TypeSelection> {
        let mut type_selections = Vec::new();
        for selection in selections {
            match selection {
                Selection::FragmentSpread(_) => {
                    panic!("There should be no fragment spreads in the raw response IR.");
                }
                Selection::InlineFragment(inline_fragment) => {
                    self.raw_response_visit_inline_fragment(&mut type_selections, inline_fragment)
                }
                Selection::LinkedField(linked_field) => self.gen_visit_linked_field(
                    &mut type_selections,
                    linked_field,
                    Self::raw_response_visit_selections,
                ),
                Selection::ScalarField(scalar_field) => {
                    self.visit_scalar_field(&mut type_selections, scalar_field)
                }
                Selection::Condition(condition) => {
                    type_selections
                        .extend(self.raw_response_visit_selections(&condition.selections));
                }
            }
        }
        type_selections
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
    document_name: Option<StringKey>,
}
impl TypeSelection {
    fn is_typename(&self) -> bool {
        if let Some(schema_name) = self.schema_name {
            schema_name == *KEY_TYPENAME
        } else {
            false
        }
    }
}

#[derive(Eq, Hash, PartialEq, Clone, Copy, Debug)]
struct TypeSelectionKey {
    key: StringKey,
    concrete_type: Option<Type>,
}
type TypeSelectionMap = IndexMap<TypeSelectionKey, TypeSelection>;

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
    mut a: TypeSelectionMap,
    b: TypeSelectionMap,
    should_set_conditional: bool,
) -> TypeSelectionMap {
    for (key, value) in b {
        a.insert(
            key,
            merge_selection(a.get(&key).cloned(), value, should_set_conditional),
        );
    }
    a
}

fn is_plural(node: &FragmentDefinition) -> bool {
    RelayDirective::find(&node.directives).map_or(false, |relay_directive| relay_directive.plural)
}

fn selections_to_map(selections: Vec<TypeSelection>, append_type: bool) -> TypeSelectionMap {
    let mut map: TypeSelectionMap = Default::default();
    for selection in selections {
        let key = if append_type {
            TypeSelectionKey {
                key: selection.key,
                concrete_type: selection.concrete_type,
            }
        } else {
            TypeSelectionKey {
                key: selection.key,
                concrete_type: None,
            }
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
            key: *KEY_FRAGMENT_REFS,
            conditional: false,
            value: Some(value),
            schema_name: None,
            node_type: None,
            concrete_type: None,
            ref_: None,
            node_selections: None,
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

fn has_raw_response_type_directive(operation: &OperationDefinition) -> bool {
    operation
        .directives
        .named(*RAW_RESPONSE_TYPE_DIRECTIVE_NAME)
        .is_some()
}

fn apply_required_directive_nullability(
    field_type: &TypeReference,
    directives: &[Directive],
) -> TypeReference {
    match directives.named(*REQUIRED_METADATA_KEY) {
        Some(_) => field_type.non_null(),
        None => match directives.named(*CHILDREN_CAN_BUBBLE_METADATA_KEY) {
            Some(_) => field_type.with_nullable_item_type(),
            None => field_type.clone(),
        },
    }
}
