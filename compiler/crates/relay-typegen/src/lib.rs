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
use itertools::Itertools;
use lazy_static::lazy_static;
use relay_codegen::JsModuleFormat;
use relay_transforms::{
    extract_refetch_metadata_from_directive, RefetchableDerivedFromMetadata, RelayDirective,
    CHILDREN_CAN_BUBBLE_METADATA_KEY, CLIENT_EXTENSION_DIRECTIVE_NAME, MATCH_CONSTANTS,
    RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN, RELAY_RESOLVER_IMPORT_PATH_ARGUMENT_NAME,
    RELAY_RESOLVER_METADATA_DIRECTIVE_NAME, RELAY_RESOLVER_METADATA_FIELD_ALIAS,
    RELAY_RESOLVER_METADATA_FIELD_NAME, RELAY_RESOLVER_METADATA_FIELD_PARENT_TYPE,
    REQUIRED_METADATA_KEY,
};
use schema::{EnumID, SDLSchema, ScalarID, Schema, Type, TypeReference};
use std::hash::Hash;
use std::{fmt::Result, path::Path};
use writer::{Prop, AST, SPREAD_KEY};

lazy_static! {
    pub(crate) static ref KEY_DATA: StringKey = "$data".intern();
    pub(crate) static ref KEY_FRAGMENT_REFS: StringKey = "$fragmentRefs".intern();
    pub(crate) static ref KEY_REF_TYPE: StringKey = "$refType".intern();
    static ref ACTOR_CHANGE_POINT: StringKey = "ActorChangePoint".intern();
    static ref FRAGMENT_PROP_NAME: StringKey = "__fragmentPropName".intern();
    static ref FUTURE_ENUM_VALUE: StringKey = "%future added value".intern();
    static ref JS_FIELD_NAME: StringKey = "js".intern();
    static ref KEY_RAW_RESPONSE: StringKey = "rawResponse".intern();
    static ref KEY_TYPENAME: StringKey = "__typename".intern();
    static ref LOCAL_3D_PAYLOAD: StringKey = "Local3DPayload".intern();
    static ref MODULE_COMPONENT: StringKey = "__module_component".intern();
    static ref RAW_RESPONSE_TYPE_DIRECTIVE_NAME: StringKey = "raw_response_type".intern();
    static ref REACT_RELAY_MULTI_ACTOR: StringKey = "react-relay/multi-actor".intern();
    static ref RELAY_RUNTIME: StringKey = "relay-runtime".intern();
    static ref RESPONSE: StringKey = "response".intern();
    static ref TYPE_BOOLEAN: StringKey = "Boolean".intern();
    static ref TYPE_FLOAT: StringKey = "Float".intern();
    static ref TYPE_ID: StringKey = "ID".intern();
    static ref TYPE_INT: StringKey = "Int".intern();
    static ref TYPE_STRING: StringKey = "String".intern();
    static ref VARIABLES: StringKey = "variables".intern();
}

pub fn generate_fragment_type(
    fragment: &FragmentDefinition,
    schema: &SDLSchema,
    js_module_format: JsModuleFormat,
    typegen_config: &TypegenConfig,
) -> String {
    let mut generator = TypeGenerator::new(schema, js_module_format, typegen_config);
    generator.generate_fragment_type(fragment).unwrap();
    generator.into_string()
}

pub fn generate_operation_type(
    typegen_operation: &OperationDefinition,
    normalization_operation: &OperationDefinition,
    schema: &SDLSchema,
    js_module_format: JsModuleFormat,
    typegen_config: &TypegenConfig,
) -> String {
    let mut generator = TypeGenerator::new(schema, js_module_format, typegen_config);
    generator
        .generate_operation_type(typegen_operation, normalization_operation)
        .unwrap();
    generator.into_string()
}

pub fn generate_split_operation_type(
    typegen_operation: &OperationDefinition,
    normalization_operation: &OperationDefinition,
    schema: &SDLSchema,
    js_module_format: JsModuleFormat,
    typegen_config: &TypegenConfig,
) -> String {
    let mut generator = TypeGenerator::new(schema, js_module_format, typegen_config);
    generator
        .generate_split_operation_type(typegen_operation, normalization_operation)
        .unwrap();
    generator.into_string()
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

struct TypeGenerator<'a> {
    schema: &'a SDLSchema,
    generated_fragments: FnvHashSet<StringKey>,
    generated_input_object_types: IndexMap<StringKey, GeneratedInputObject>,
    imported_raw_response_types: IndexSet<StringKey>,
    imported_resolvers: IndexMap<StringKey, StringKey>,
    used_enums: FnvHashSet<EnumID>,
    used_fragments: FnvHashSet<StringKey>,
    typegen_config: &'a TypegenConfig,
    js_module_format: JsModuleFormat,
    runtime_imports: RuntimeImports,
    match_fields: IndexMap<StringKey, AST>,
    writer: Box<dyn Writer>,
    has_actor_change: bool,
}
impl<'a> TypeGenerator<'a> {
    fn new(
        schema: &'a SDLSchema,
        js_module_format: JsModuleFormat,
        typegen_config: &'a TypegenConfig,
    ) -> Self {
        Self {
            schema,
            generated_fragments: Default::default(),
            generated_input_object_types: Default::default(),
            imported_raw_response_types: Default::default(),
            imported_resolvers: Default::default(),
            used_enums: Default::default(),
            used_fragments: Default::default(),
            js_module_format,
            typegen_config,
            match_fields: Default::default(),
            runtime_imports: RuntimeImports::default(),
            writer: Self::create_writer(typegen_config),
            has_actor_change: false,
        }
    }

    fn into_string(self) -> String {
        self.writer.into_string()
    }

    fn create_writer(typegen_config: &TypegenConfig) -> Box<dyn Writer> {
        match &typegen_config.language {
            TypegenLanguage::Flow => Box::new(FlowPrinter::new()),
            TypegenLanguage::TypeScript => Box::new(TypeScriptPrinter::new(typegen_config)),
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
        let mut response_type = self.selections_to_babel(selections.into_iter(), false, None);

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
            Some(self.raw_response_selections_to_babel(raw_response_selections.into_iter(), None))
        } else {
            None
        };

        let refetchable_fragment_name =
            RefetchableDerivedFromMetadata::from_directives(&typegen_operation.directives);
        if refetchable_fragment_name.is_some() {
            self.runtime_imports.fragment_reference = true;
        }

        // Always include 'FragmentRef' for typescript codegen for operations that have fragment spreads
        if self.typegen_config.language == TypegenLanguage::TypeScript
            && has_fragment_spread(typegen_operation)
        {
            self.runtime_imports.fragment_reference = true;
        }

        self.write_import_actor_change_point()?;
        self.write_runtime_imports()?;
        if let Some(refetchable_fragment_name) = refetchable_fragment_name {
            self.write_fragment_refs_for_refetchable(refetchable_fragment_name)?;
        } else {
            self.write_fragment_imports()?;
        }
        self.write_relay_resolver_imports()?;
        self.write_split_raw_response_type_imports()?;
        self.write_enum_definitions()?;
        self.write_input_object_types()?;
        self.writer
            .write_export_type(input_variables_identifier, &input_variables_type)?;
        self.writer
            .write_export_type(response_identifier, &response_type)?;

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
                self.writer.write_export_type(*key, &ast)?;
            }
            let raw_response_identifier =
                format!("{}RawResponse", typegen_operation.name.item).intern();
            self.writer
                .write_export_type(raw_response_identifier, &raw_response_type)?;
            operation_types.push(Prop {
                key: *KEY_RAW_RESPONSE,
                read_only: false,
                optional: false,
                value: AST::Identifier(raw_response_identifier),
            })
        }

        self.writer.write_export_type(
            typegen_operation.name.item,
            &AST::ExactObject(operation_types),
        )?;
        Ok(())
    }

    fn generate_split_operation_type(
        &mut self,
        typegen_operation: &OperationDefinition,
        normalization_operation: &OperationDefinition,
    ) -> Result {
        let raw_response_selections =
            self.raw_response_visit_selections(&normalization_operation.selections);
        let raw_response_type =
            self.raw_response_selections_to_babel(raw_response_selections.into_iter(), None);

        self.write_runtime_imports()?;
        self.write_fragment_imports()?;
        self.write_split_raw_response_type_imports()?;
        self.write_enum_definitions()?;
        for (key, ast) in self.match_fields.iter() {
            self.writer.write_export_type(*key, &ast)?;
        }

        self.writer
            .write_export_type(typegen_operation.name.item, &raw_response_type)?;

        Ok(())
    }

    fn generate_fragment_type(&mut self, node: &FragmentDefinition) -> Result {
        let mut selections = self.visit_selections(&node.selections);
        if !node.type_condition.is_abstract_type() {
            let num_concrete_selections = selections
                .iter()
                .filter(|sel| sel.concrete_type.is_some())
                .count();
            if num_concrete_selections <= 1 {
                for selection in selections.iter_mut().filter(|sel| sel.is_typename()) {
                    selection.concrete_type = Some(node.type_condition);
                }
            }
        }
        self.generated_fragments.insert(node.name.item);

        let data_type = node.name.item;
        let data_type_name = format!("{}$data", data_type).intern();

        let ref_type_data_property = Prop {
            key: *KEY_DATA,
            optional: true,
            read_only: true,
            value: AST::Identifier(data_type_name),
        };
        let old_fragment_type_name = node.name.item;
        let new_fragment_type_name = format!("{}$fragmentType", node.name.item).intern();
        let ref_type_fragment_ref_property = Prop {
            key: *KEY_FRAGMENT_REFS,
            optional: false,
            read_only: true,
            value: AST::FragmentReference(vec![old_fragment_type_name]),
        };
        let is_plural_fragment = is_plural(node);
        let mut ref_type =
            AST::InexactObject(vec![ref_type_data_property, ref_type_fragment_ref_property]);
        if is_plural_fragment {
            ref_type = AST::ReadOnlyArray(Box::new(ref_type));
        }

        let unmasked = RelayDirective::is_unmasked_fragment_definition(&node);

        let base_type = self.selections_to_babel(
            selections.into_iter(),
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
        self.write_import_actor_change_point()?;
        self.write_fragment_imports()?;
        self.write_enum_definitions()?;
        self.write_runtime_imports()?;
        self.write_relay_resolver_imports()?;

        let refetchable_metadata = extract_refetch_metadata_from_directive(&node.directives);
        let old_fragment_type_name = format!("{}$ref", old_fragment_type_name).intern();
        if let Some(refetchable_metadata) = refetchable_metadata {
            match self.js_module_format {
                JsModuleFormat::CommonJS => {
                    // TODO(T22653277) support non-haste environments when
                    // importing fragments
                    self.writer
                        .write_any_type_definition(old_fragment_type_name)?;
                    self.writer
                        .write_any_type_definition(new_fragment_type_name)?;
                }
                JsModuleFormat::Haste => {
                    self.writer.write_import_fragment_type(
                        &[old_fragment_type_name, new_fragment_type_name],
                        format!("{}.graphql", refetchable_metadata.operation_name).intern(),
                    )?;
                }
            }
            self.writer
                .write_export_fragment_types(old_fragment_type_name, new_fragment_type_name)?;
        } else {
            self.writer
                .write_export_fragment_type(old_fragment_type_name, new_fragment_type_name)?;
        }

        self.writer.write_export_type(data_type, &type_)?;
        self.writer
            .write_export_type(data_type_name, &AST::RawType(data_type))?;
        self.writer
            .write_export_type(format!("{}$key", node.name.item).intern(), &ref_type)?;

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
        if let Some(module_directive) = fragment_spread
            .directives
            .named(*RELAY_RESOLVER_METADATA_DIRECTIVE_NAME)
        {
            self.visit_relay_resolver_fragment(type_selections, module_directive);
        } else {
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
    }

    fn visit_relay_resolver_fragment(
        &mut self,
        type_selections: &mut Vec<TypeSelection>,
        metadata_directive: &Directive,
    ) {
        let field_name = expect_string_literal_directive_argument_value(
            metadata_directive,
            *RELAY_RESOLVER_METADATA_FIELD_NAME,
        );

        let module_path = expect_string_literal_directive_argument_value(
            metadata_directive,
            *RELAY_RESOLVER_IMPORT_PATH_ARGUMENT_NAME,
        );

        let field_alias = metadata_directive
            .arguments
            .named(*RELAY_RESOLVER_METADATA_FIELD_ALIAS)
            .map(|arg| arg.value.item.expect_string_literal());

        let key = field_alias.unwrap_or(field_name);

        let parent_type = expect_string_literal_directive_argument_value(
            metadata_directive,
            *RELAY_RESOLVER_METADATA_FIELD_PARENT_TYPE,
        );

        let local_resolver_name =
            to_camel_case(format!("{}_{}_resolver", parent_type, field_name)).intern();

        // TODO(T86853359): Support non-haste environments when generating Relay Resolver types
        let haste_import_name = Path::new(&module_path.to_string())
            .file_stem()
            .unwrap()
            .to_string_lossy()
            .intern();

        self.imported_resolvers
            .entry(haste_import_name)
            .or_insert(local_resolver_name);

        type_selections.push(TypeSelection {
            key,
            schema_name: None,
            node_type: None,
            value: Some(AST::FunctionReturnType(local_resolver_name)),
            conditional: false,
            concrete_type: None,
            ref_: None,
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
            let name = expect_string_literal_directive_argument_value(
                module_directive,
                MATCH_CONSTANTS.name_arg,
            );
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
        } else if inline_fragment
            .directives
            .named(*RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN)
            .is_some()
        {
            self.visit_actor_change(type_selections, &inline_fragment);
        } else {
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
    }

    fn visit_actor_change(
        &mut self,
        type_selections: &mut Vec<TypeSelection>,
        inline_fragment: &InlineFragment,
    ) {
        let linked_field = match &inline_fragment.selections[0] {
            Selection::LinkedField(linked_field) => linked_field,
            _ => {
                panic!("Expect to have only linked field in the selection of the actor change")
            }
        };

        self.has_actor_change = true;
        let field = self.schema.field(linked_field.definition.item);
        let schema_name = field.name;
        let key = if let Some(alias) = linked_field.alias {
            alias.item
        } else {
            schema_name
        };

        let linked_field_selections = self.visit_selections(&linked_field.selections);
        type_selections.push(TypeSelection {
            key,
            schema_name: Some(schema_name),
            node_type: None,
            value: Some(AST::Nullable(Box::new(AST::ActorChangePoint(Box::new(
                self.selections_to_babel(linked_field_selections.into_iter(), false, None),
            ))))),
            conditional: false,
            concrete_type: None,
            ref_: None,
            node_selections: None,
            document_name: None,
        });
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
            let directive_arg_name = expect_string_literal_directive_argument_value(
                module_directive,
                MATCH_CONSTANTS.name_arg,
            );
            let directive_arg_key = expect_string_literal_directive_argument_value(
                module_directive,
                MATCH_CONSTANTS.key_arg,
            );

            if !self.match_fields.contains_key(&directive_arg_name) {
                let match_field = self.raw_response_selections_to_babel(
                    selections
                        .iter()
                        .filter(|sel| sel.schema_name != Some(*JS_FIELD_NAME))
                        .cloned(),
                    None,
                );
                self.match_fields.insert(directive_arg_name, match_field);
            }

            type_selections.extend(
                selections
                    .iter()
                    .filter(|sel| sel.schema_name == Some(*JS_FIELD_NAME))
                    .cloned(),
            );

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
            node_selections: Some(selections_to_map(selections.into_iter(), true)),
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
        selections: impl Iterator<Item = TypeSelection>,
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
                    group_refs(base_fields.values().cloned().chain(selections))
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
                        value: AST::OtherTypename,
                    })
                    .collect(),
            );
        } else {
            let mut selection_map = selections_to_map(hashmap_into_values(base_fields), false);
            for concrete_type_selections in hashmap_into_values(by_concrete_type) {
                selection_map = merge_selections(
                    selection_map,
                    selections_to_map(
                        concrete_type_selections.into_iter().map(|mut sel| {
                            sel.conditional = true;
                            sel
                        }),
                        false,
                    ),
                    true,
                )
            }
            let selection_map_values = group_refs(hashmap_into_values(selection_map))
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
                            value: AST::FragmentReferenceType(fragment_type_name),
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
        selections: impl Iterator<Item = TypeSelection>,
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

        if base_fields.is_empty() && by_concrete_type.is_empty() {
            // base fields and per-type fields are all empty: this can only occur bc the only selection was a
            // @no_inline fragment. in this case, emit a single, empty ExactObject since nothing was selected
            return AST::ExactObject(Default::default());
        }

        let mut types: Vec<AST> = Vec::new();

        if !by_concrete_type.is_empty() {
            let base_fields_map = selections_to_map(base_fields.clone().into_iter(), false);
            for (concrete_type, selections) in by_concrete_type {
                let merged_selections: Vec<_> = hashmap_into_values(merge_selections(
                    base_fields_map.clone(),
                    selections_to_map(selections.into_iter(), false),
                    false,
                ))
                .collect();
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
                hashmap_into_values(node_selections.unwrap()),
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
                hashmap_into_values(node_selections.unwrap()),
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
            if self.typegen_config.require_custom_scalar_types {
                panic!(
                    "Expected the JS type for '{}' to be defined, please update 'customScalarTypes' in your compiler config.",
                    scalar_name
                );
            }
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
            } => self.writer.write_import_type(
                &[self.writer.get_runtime_fragment_import(), *LOCAL_3D_PAYLOAD],
                *RELAY_RUNTIME,
            ),
            RuntimeImports {
                local_3d_payload: true,
                fragment_reference: false,
            } => self
                .writer
                .write_import_type(&[*LOCAL_3D_PAYLOAD], *RELAY_RUNTIME),
            RuntimeImports {
                local_3d_payload: false,
                fragment_reference: true,
            } => self
                .writer
                .write_import_type(&[self.writer.get_runtime_fragment_import()], *RELAY_RUNTIME),
            RuntimeImports {
                local_3d_payload: false,
                fragment_reference: false,
            } => Ok(()),
        }
    }

    fn write_fragment_imports(&mut self) -> Result {
        for used_fragment in self.used_fragments.iter().sorted() {
            let fragment_type_name = get_old_fragment_type_name(*used_fragment);
            if !self.generated_fragments.contains(used_fragment) {
                match self.js_module_format {
                    JsModuleFormat::CommonJS => {
                        // if useSingleArtifactDirectory {
                        //   importTypes([fragmentTypeName], './' + usedFragment + '.graphql');
                        // } else {
                        self.writer.write_any_type_definition(fragment_type_name)?;
                    }
                    JsModuleFormat::Haste => {
                        // TODO(T22653277) support non-haste environments when importing
                        // fragments
                        self.writer.write_import_fragment_type(
                            &[fragment_type_name],
                            format!("{}.graphql", used_fragment).intern(),
                        )?;
                    }
                }
            }
        }
        Ok(())
    }

    fn write_import_actor_change_point(&mut self) -> Result {
        if self.has_actor_change {
            self.writer
                .write_import_type(&[*ACTOR_CHANGE_POINT], *REACT_RELAY_MULTI_ACTOR)
        } else {
            Ok(())
        }
    }

    fn write_relay_resolver_imports(&mut self) -> Result {
        for (from, name) in self.imported_resolvers.iter_mut().sorted() {
            self.writer.write_import_module_default(*name, *from)?
        }
        Ok(())
    }

    fn write_split_raw_response_type_imports(&mut self) -> Result {
        if self.imported_raw_response_types.is_empty() {
            return Ok(());
        }

        for &imported_raw_response_type in self.imported_raw_response_types.iter().sorted() {
            match self.js_module_format {
                JsModuleFormat::CommonJS => {
                    self.writer
                        .write_any_type_definition(imported_raw_response_type)?;
                }
                JsModuleFormat::Haste => {
                    self.writer.write_import_fragment_type(
                        &[imported_raw_response_type],
                        format!("{}.graphql", imported_raw_response_type).intern(),
                    )?;
                }
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
        self.writer
            .write_export_fragment_type(old_fragment_type_name, new_fragment_type_name)
    }

    fn write_enum_definitions(&mut self) -> Result {
        let mut enum_ids: Vec<_> = self.used_enums.iter().cloned().collect();
        enum_ids.sort_by_key(|enum_id| self.schema.enum_(*enum_id).name);
        for enum_id in enum_ids {
            let enum_type = self.schema.enum_(enum_id);
            if let Some(enum_module_suffix) = &self.typegen_config.enum_module_suffix {
                self.writer.write_import_type(
                    &[enum_type.name],
                    format!("{}{}", enum_type.name, enum_module_suffix).intern(),
                )?;
            } else {
                let mut members: Vec<AST> = enum_type
                    .values
                    .iter()
                    .map(|enum_value| AST::StringLiteral(enum_value.value))
                    .collect();
                members.push(AST::StringLiteral(*FUTURE_ENUM_VALUE));
                self.writer
                    .write_export_type(enum_type.name, &AST::Union(members))?;
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
                    self.writer
                        .write_export_type(*type_identifier, input_object_type)?;
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
                Selection::FragmentSpread(spread) => {
                    let spread_type = spread.fragment.item;
                    self.imported_raw_response_types.insert(spread_type);
                    type_selections.push(TypeSelection {
                        key: *SPREAD_KEY,
                        conditional: false,
                        value: Some(AST::Identifier(spread_type)),
                        schema_name: None,
                        node_type: None,
                        concrete_type: None,
                        ref_: None,
                        node_selections: None,
                        document_name: None,
                    })
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

fn selections_to_map(
    selections: impl Iterator<Item = TypeSelection>,
    append_type: bool,
) -> TypeSelectionMap {
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

// TODO: T85950736 Fix these clippy errors
#[allow(clippy::while_let_on_iterator, clippy::useless_conversion)]
fn group_refs(props: impl Iterator<Item = TypeSelection>) -> impl Iterator<Item = TypeSelection> {
    let mut refs = None;
    let mut props = props.into_iter();
    std::iter::from_fn(move || {
        while let Some(prop) = props.next() {
            if let Some(ref_) = prop.ref_ {
                refs.get_or_insert_with(Vec::new).push(ref_);
            } else {
                return Some(prop);
            }
        }
        if let Some(refs) = refs.take() {
            return Some(TypeSelection {
                key: *KEY_FRAGMENT_REFS,
                conditional: false,
                value: Some(AST::FragmentReference(refs)),
                schema_name: None,
                node_type: None,
                concrete_type: None,
                ref_: None,
                node_selections: None,
                document_name: None,
            });
        }
        None
    })
}

fn hashmap_into_values<K: Hash + Eq, V>(map: IndexMap<K, V>) -> impl Iterator<Item = V> {
    map.into_iter().map(|(_, val)| val)
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

fn has_fragment_spread(operation: &OperationDefinition) -> bool {
    let mut selections: Vec<&[Selection]> = vec![&operation.selections];
    while let Some(selection) = selections.pop() {
        for sel in selection.iter() {
            match sel {
                Selection::FragmentSpread(_) => {
                    return true;
                }
                Selection::Condition(condition) => selections.push(&condition.selections),
                Selection::LinkedField(linked_field) => selections.push(&linked_field.selections),
                Selection::InlineFragment(inline_fragment) => {
                    selections.push(&inline_fragment.selections)
                }
                Selection::ScalarField(_) => {}
            }
        }
    }

    false
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

fn expect_string_literal_directive_argument_value(
    directive: &Directive,
    argument_name: StringKey,
) -> StringKey {
    directive
        .arguments
        .named(argument_name)
        .unwrap()
        .value
        .item
        .expect_string_literal()
}

/// Converts a `String` to a camel case `String`
fn to_camel_case(non_camelized_string: String) -> String {
    let mut camelized_string = String::with_capacity(non_camelized_string.len());
    let mut last_character_was_not_alphanumeric = false;
    for (i, ch) in non_camelized_string.chars().enumerate() {
        if !ch.is_alphanumeric() {
            last_character_was_not_alphanumeric = true;
        } else if last_character_was_not_alphanumeric {
            camelized_string.push(ch.to_ascii_uppercase());
            last_character_was_not_alphanumeric = false;
        } else {
            camelized_string.push(if i == 0 { ch.to_ascii_lowercase() } else { ch });
            last_character_was_not_alphanumeric = false;
        }
    }
    camelized_string
}
