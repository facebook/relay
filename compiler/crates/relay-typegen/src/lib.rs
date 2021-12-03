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
use crate::writer::{GetterSetterPairProp, KeyValuePairProp, SpreadProp, Writer};
use common::NamedItem;
use config::FlowTypegenPhase;
pub use config::{FlowTypegenConfig, TypegenConfig, TypegenLanguage};
use fnv::FnvHashSet;
use graphql_ir::{
    Condition, Directive, FragmentDefinition, FragmentSpread, InlineFragment, LinkedField,
    OperationDefinition, ScalarField, Selection,
};
use indexmap::{map::Entry, IndexMap, IndexSet};
use intern::string_key::{Intern, StringKey};
use itertools::Itertools;
use lazy_static::lazy_static;
use relay_codegen::JsModuleFormat;
use relay_transforms::{
    ModuleMetadata, RefetchableDerivedFromMetadata, RefetchableMetadata, RelayDirective,
    RelayResolverSpreadMetadata, RequiredMetadataDirective, CHILDREN_CAN_BUBBLE_METADATA_KEY,
    CLIENT_EXTENSION_DIRECTIVE_NAME, RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN,
    UPDATABLE_DIRECTIVE_NAME,
};
use schema::{EnumID, SDLSchema, ScalarID, Schema, Type, TypeReference};
use std::hash::Hash;
use std::{fmt::Result, path::Path};
use writer::{Prop, AST};

static REACT_RELAY_MULTI_ACTOR: &str = "react-relay/multi-actor";
static RELAY_RUNTIME: &str = "relay-runtime";
static LOCAL_3D_PAYLOAD: &str = "Local3DPayload";
static ACTOR_CHANGE_POINT: &str = "ActorChangePoint";

lazy_static! {
    pub(crate) static ref KEY_DATA: StringKey = "$data".intern();
    static ref KEY_FRAGMENT_SPREADS: StringKey = "$fragmentSpreads".intern();
    pub(crate) static ref KEY_FRAGMENT_TYPE: StringKey = "$fragmentType".intern();
    static ref FRAGMENT_PROP_NAME: StringKey = "__fragmentPropName".intern();
    static ref FUTURE_ENUM_VALUE: StringKey = "%future added value".intern();
    static ref JS_FIELD_NAME: StringKey = "js".intern();
    static ref KEY_RAW_RESPONSE: StringKey = "rawResponse".intern();
    static ref KEY_TYPENAME: StringKey = "__typename".intern();
    static ref KEY_ID: StringKey = "id".intern();
    static ref KEY_NODE: StringKey = "node".intern();
    static ref KEY_NODES: StringKey = "nodes".intern();
    static ref MODULE_COMPONENT: StringKey = "__module_component".intern();
    static ref RAW_RESPONSE_TYPE_DIRECTIVE_NAME: StringKey = "raw_response_type".intern();
    static ref RESPONSE: StringKey = "response".intern();
    static ref TYPE_BOOLEAN: StringKey = "Boolean".intern();
    static ref TYPE_FLOAT: StringKey = "Float".intern();
    static ref TYPE_ID: StringKey = "ID".intern();
    static ref TYPE_INT: StringKey = "Int".intern();
    static ref TYPE_STRING: StringKey = "String".intern();
    static ref VARIABLES: StringKey = "variables".intern();
    static ref SPREAD_KEY: StringKey = "\0SPREAD".intern();
}

pub fn generate_fragment_type(
    fragment: &FragmentDefinition,
    schema: &SDLSchema,
    js_module_format: JsModuleFormat,
    typegen_config: &TypegenConfig,
) -> String {
    let mut generator =
        TypeGenerator::new(schema, js_module_format, typegen_config, fragment.name.item);
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
    let rollout_key = RefetchableDerivedFromMetadata::find(&typegen_operation.directives)
        .map_or(typegen_operation.name.item, |metadata| metadata.0);
    let mut generator = TypeGenerator::new(schema, js_module_format, typegen_config, rollout_key);
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
    let mut generator = TypeGenerator::new(
        schema,
        js_module_format,
        typegen_config,
        typegen_operation.name.item,
    );
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
    flow_typegen_phase: FlowTypegenPhase,
    is_updatable_operation: bool,
}
impl<'a> TypeGenerator<'a> {
    fn new(
        schema: &'a SDLSchema,
        js_module_format: JsModuleFormat,
        typegen_config: &'a TypegenConfig,
        rollout_key: StringKey,
    ) -> Self {
        let flow_typegen_phase = typegen_config.flow_typegen.phase(rollout_key);
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
            writer: match &typegen_config.language {
                TypegenLanguage::Flow => Box::new(FlowPrinter::new(flow_typegen_phase)),
                TypegenLanguage::TypeScript => Box::new(TypeScriptPrinter::new(typegen_config)),
            },
            has_actor_change: false,
            flow_typegen_phase,
            is_updatable_operation: false,
        }
    }

    fn into_string(self) -> String {
        self.writer.into_string()
    }

    fn generate_operation_type(
        &mut self,
        typegen_operation: &OperationDefinition,
        normalization_operation: &OperationDefinition,
    ) -> Result {
        let old_variables_identifier = format!("{}Variables", typegen_operation.name.item);

        self.is_updatable_operation = typegen_operation
            .directives
            .named(*UPDATABLE_DIRECTIVE_NAME)
            .is_some();

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
            RefetchableDerivedFromMetadata::find(&typegen_operation.directives);
        if refetchable_fragment_name.is_some() {
            self.runtime_imports.fragment_reference = true;
        }

        // Always include 'FragmentRef' for typescript codegen for operations that have fragment spreads
        if self.typegen_config.language == TypegenLanguage::TypeScript
            && has_fragment_spread(&typegen_operation.selections)
        {
            self.runtime_imports.fragment_reference = true;
        }

        self.write_import_actor_change_point()?;
        self.write_runtime_imports()?;
        self.write_fragment_imports()?;
        self.write_relay_resolver_imports()?;
        self.write_split_raw_response_type_imports()?;
        self.write_enum_definitions()?;
        self.write_input_object_types()?;

        match self.flow_typegen_phase {
            FlowTypegenPhase::Phase4 => {
                let new_variables_identifier = format!("{}$variables", typegen_operation.name.item);
                self.writer
                    .write_export_type(&new_variables_identifier, &input_variables_type)?;
                self.writer.write_export_type(
                    &old_variables_identifier,
                    &AST::Identifier(new_variables_identifier.intern()),
                )?;
            }
            FlowTypegenPhase::Final => {
                let new_variables_identifier = format!("{}$variables", typegen_operation.name.item);
                self.writer
                    .write_export_type(&new_variables_identifier, &input_variables_type)?;
            }
        }


        let response_identifier = match self.flow_typegen_phase {
            FlowTypegenPhase::Phase4 => {
                let new_response_identifier = format!("{}$data", typegen_operation.name.item);
                let old_response_identifier = format!("{}Response", typegen_operation.name.item);
                self.writer
                    .write_export_type(&new_response_identifier, &response_type)?;
                self.writer.write_export_type(
                    &old_response_identifier,
                    &AST::Identifier(new_response_identifier.as_str().intern()),
                )?;
                new_response_identifier
            }
            FlowTypegenPhase::Final => {
                let new_response_identifier = format!("{}$data", typegen_operation.name.item);
                self.writer
                    .write_export_type(&new_response_identifier, &response_type)?;
                new_response_identifier
            }
        };

        match self.flow_typegen_phase {
            FlowTypegenPhase::Phase4 => {
                let mut operation_types = vec![
                    Prop::KeyValuePair(KeyValuePairProp {
                        key: *VARIABLES,
                        read_only: false,
                        optional: false,
                        value: AST::Identifier(old_variables_identifier.intern()),
                    }),
                    Prop::KeyValuePair(KeyValuePairProp {
                        key: *RESPONSE,
                        read_only: false,
                        optional: false,
                        value: AST::Identifier(response_identifier.intern()),
                    }),
                ];

                if let Some(raw_response_type) = raw_response_type {
                    for (key, ast) in self.match_fields.iter() {
                        self.writer.write_export_type(key.lookup(), ast)?;
                    }
                    let old_raw_response_identifier =
                        format!("{}RawResponse", typegen_operation.name.item);
                    let new_raw_response_identifier =
                        format!("{}$rawResponse", typegen_operation.name.item);
                    let new_raw_response_identifier_ast =
                        AST::Identifier((&new_raw_response_identifier).intern());

                    self.writer
                        .write_export_type(&new_raw_response_identifier, &raw_response_type)?;
                    self.writer.write_export_type(
                        &old_raw_response_identifier,
                        &new_raw_response_identifier_ast,
                    )?;

                    operation_types.push(Prop::KeyValuePair(KeyValuePairProp {
                        key: *KEY_RAW_RESPONSE,
                        read_only: false,
                        optional: false,
                        value: new_raw_response_identifier_ast,
                    }));
                }

                self.writer.write_export_type(
                    typegen_operation.name.item.lookup(),
                    &AST::ExactObject(operation_types),
                )?;
            }
            FlowTypegenPhase::Final => {
                if let Some(raw_response_type) = raw_response_type {
                    for (key, ast) in self.match_fields.iter() {
                        self.writer.write_export_type(key.lookup(), ast)?;
                    }
                    let raw_response_identifier =
                        format!("{}$rawResponse", typegen_operation.name.item);
                    self.writer
                        .write_export_type(&raw_response_identifier, &raw_response_type)?;
                }

                if self.typegen_config.language == TypegenLanguage::TypeScript {
                    let new_variables_identifier =
                        format!("{}$variables", typegen_operation.name.item);
                    let operation_types = vec![
                        Prop::KeyValuePair(KeyValuePairProp {
                            key: *VARIABLES,
                            read_only: false,
                            optional: false,
                            value: AST::Identifier(new_variables_identifier.intern()),
                        }),
                        Prop::KeyValuePair(KeyValuePairProp {
                            key: *RESPONSE,
                            read_only: false,
                            optional: false,
                            value: AST::Identifier(response_identifier.intern()),
                        }),
                    ];
                    self.writer.write_export_type(
                        typegen_operation.name.item.lookup(),
                        &AST::ExactObject(operation_types),
                    )?;
                }
            }
        }
        self.is_updatable_operation = false;
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
            self.writer.write_export_type(key.lookup(), ast)?;
        }

        self.writer
            .write_export_type(typegen_operation.name.item.lookup(), &raw_response_type)?;

        Ok(())
    }

    fn generate_fragment_type(&mut self, node: &FragmentDefinition) -> Result {
        let mut selections = self.visit_selections(&node.selections);
        if !node.type_condition.is_abstract_type() {
            let num_concrete_selections = selections
                .iter()
                .filter(|sel| sel.get_enclosing_concrete_type().is_some())
                .count();
            if num_concrete_selections <= 1 {
                for selection in selections.iter_mut().filter(|sel| sel.is_typename()) {
                    selection.set_concrete_type(node.type_condition);
                }
            }
        }
        self.generated_fragments.insert(node.name.item);

        let data_type = node.name.item;
        let data_type_name = format!("{}$data", data_type);

        let ref_type_data_property = Prop::KeyValuePair(KeyValuePairProp {
            key: *KEY_DATA,
            optional: true,
            read_only: true,
            value: AST::Identifier(data_type_name.as_str().intern()),
        });
        let fragment_name = node.name.item;
        let ref_type_fragment_spreads_property = Prop::KeyValuePair(KeyValuePairProp {
            key: *KEY_FRAGMENT_SPREADS,
            optional: false,
            read_only: true,
            value: AST::FragmentReference(vec![fragment_name]),
        });
        let is_plural_fragment = is_plural(node);
        let mut ref_type = AST::InexactObject(vec![
            ref_type_data_property,
            ref_type_fragment_spreads_property,
        ]);
        if is_plural_fragment {
            ref_type = AST::ReadOnlyArray(Box::new(ref_type));
        }

        let unmasked = RelayDirective::is_unmasked_fragment_definition(node);

        let base_type = self.selections_to_babel(
            selections.into_iter(),
            unmasked,
            if unmasked { None } else { Some(fragment_name) },
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

        let refetchable_metadata = RefetchableMetadata::find(&node.directives);
        let old_fragment_type_name = format!("{}$ref", fragment_name);
        let new_fragment_type_name = format!("{}$fragmentType", fragment_name);
        self.writer
            .write_export_fragment_type(&old_fragment_type_name, &new_fragment_type_name)?;
        if let Some(refetchable_metadata) = refetchable_metadata {
            let variables_name = format!("{}$variables", refetchable_metadata.operation_name);
            match self.js_module_format {
                JsModuleFormat::CommonJS => {
                    self.writer.write_any_type_definition(&variables_name)?;
                }
                JsModuleFormat::Haste => {
                    self.writer.write_import_fragment_type(
                        &[&variables_name],
                        &format!("{}.graphql", refetchable_metadata.operation_name),
                    )?;
                }
            }
        }

        match self.flow_typegen_phase {
            FlowTypegenPhase::Phase4 => {
                self.writer.write_export_type(&data_type_name, &type_)?;
                self.writer.write_export_type(
                    data_type.lookup(),
                    &AST::Identifier(data_type_name.intern()),
                )?;
            }
            FlowTypegenPhase::Final => {
                self.writer.write_export_type(&data_type_name, &type_)?;
            }
        }
        self.writer
            .write_export_type(&format!("{}$key", node.name.item), &ref_type)?;

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
        if let Some(resolver_spread_metadata) =
            RelayResolverSpreadMetadata::find(&fragment_spread.directives)
        {
            self.visit_relay_resolver_fragment(type_selections, resolver_spread_metadata);
        } else {
            let name = fragment_spread.fragment.item;
            self.used_fragments.insert(name);
            type_selections.push(TypeSelection::FragmentSpread(TypeSelectionFragmentSpread {
                fragment_name: name,
                conditional: false,
                concrete_type: None,
            }));
        }
    }

    fn visit_relay_resolver_fragment(
        &mut self,
        type_selections: &mut Vec<TypeSelection>,
        resolver_spread_metadata: &RelayResolverSpreadMetadata,
    ) {
        let field_name = resolver_spread_metadata.field_name;

        let key = resolver_spread_metadata.field_alias.unwrap_or(field_name);

        let local_resolver_name = to_camel_case(format!(
            "{}_{}_resolver",
            resolver_spread_metadata.field_parent_type, field_name
        ))
        .intern();

        // TODO(T86853359): Support non-haste environments when generating Relay Resolver types
        let haste_import_name = Path::new(&resolver_spread_metadata.import_path.to_string())
            .file_stem()
            .unwrap()
            .to_string_lossy()
            .intern();

        self.imported_resolvers
            .entry(haste_import_name)
            .or_insert(local_resolver_name);

        type_selections.push(TypeSelection::ScalarField(TypeSelectionScalarField {
            field_name_or_alias: key,
            special_field: None,
            value: AST::FunctionReturnType(local_resolver_name),
            conditional: false,
            concrete_type: None,
        }));
    }

    fn visit_inline_fragment(
        &mut self,
        type_selections: &mut Vec<TypeSelection>,
        inline_fragment: &InlineFragment,
    ) {
        if let Some(module_metadata) = ModuleMetadata::find(&inline_fragment.directives) {
            let name = module_metadata.fragment_name;
            type_selections.push(TypeSelection::ScalarField(TypeSelectionScalarField {
                field_name_or_alias: *FRAGMENT_PROP_NAME,
                special_field: None,
                value: AST::Nullable(Box::new(AST::String)),
                conditional: false,
                concrete_type: None,
            }));
            type_selections.push(TypeSelection::ScalarField(TypeSelectionScalarField {
                field_name_or_alias: *MODULE_COMPONENT,
                special_field: None,
                value: AST::Nullable(Box::new(AST::String)),
                conditional: false,
                concrete_type: None,
            }));
            self.used_fragments.insert(name);
            type_selections.push(TypeSelection::InlineFragment(TypeSelectionInlineFragment {
                fragment_name: name,
                conditional: false,
                concrete_type: None,
            }));
        } else if inline_fragment
            .directives
            .named(*RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN)
            .is_some()
        {
            self.visit_actor_change(type_selections, inline_fragment);
        } else {
            let mut selections = self.visit_selections(&inline_fragment.selections);
            if let Some(type_condition) = inline_fragment.type_condition {
                for selection in &mut selections {
                    if type_condition.is_abstract_type() {
                        selection.set_conditional(true);
                    } else {
                        selection.set_concrete_type(type_condition);
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
        let schema_name = field.name.item;
        let key = if let Some(alias) = linked_field.alias {
            alias.item
        } else {
            schema_name
        };

        let linked_field_selections = self.visit_selections(&linked_field.selections);
        type_selections.push(TypeSelection::ScalarField(TypeSelectionScalarField {
            field_name_or_alias: key,
            special_field: ScalarFieldSpecialSchemaField::from_schema_name(schema_name),
            value: AST::Nullable(Box::new(AST::ActorChangePoint(Box::new(
                self.selections_to_babel(linked_field_selections.into_iter(), false, None),
            )))),
            conditional: false,
            concrete_type: None,
        }));
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
                selection.set_conditional(true);
            }
        }

        if let Some(module_metadata) = ModuleMetadata::find(&inline_fragment.directives) {
            let fragment_name = module_metadata.fragment_name;
            if !self.match_fields.contains_key(&fragment_name) {
                let match_field = self.raw_response_selections_to_babel(
                    selections.iter().filter(|sel| !sel.is_js_field()).cloned(),
                    None,
                );
                self.match_fields.insert(fragment_name, match_field);
            }

            type_selections.extend(selections.iter().filter(|sel| sel.is_js_field()).cloned());

            type_selections.push(TypeSelection::ModuleDirective(ModuleDirective {
                fragment_name,
                document_name: module_metadata.key,
                conditional: false,
                concrete_type: None,
            }));
            return;
        }
        if let Some(type_condition) = inline_fragment.type_condition {
            if !type_condition.is_abstract_type() {
                for selection in &mut selections {
                    selection.set_concrete_type(type_condition);
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
        let schema_name = field.name.item;
        let key = if let Some(alias) = linked_field.alias {
            alias.item
        } else {
            schema_name
        };
        let selections = visit_selections_fn(self, &linked_field.selections);

        let node_type =
            apply_required_directive_nullability(&field.type_, &linked_field.directives);

        type_selections.push(TypeSelection::LinkedField(TypeSelectionLinkedField {
            field_name_or_alias: key,
            node_type,
            node_selections: selections_to_map(selections.into_iter(), true),
            conditional: false,
            concrete_type: None,
        }));
    }

    fn visit_scalar_field(
        &mut self,
        type_selections: &mut Vec<TypeSelection>,
        scalar_field: &ScalarField,
    ) {
        let field = self.schema.field(scalar_field.definition.item);
        let schema_name = field.name.item;
        let key = if let Some(alias) = scalar_field.alias {
            alias.item
        } else {
            schema_name
        };
        let field_type =
            apply_required_directive_nullability(&field.type_, &scalar_field.directives);
        type_selections.push(TypeSelection::ScalarField(TypeSelectionScalarField {
            field_name_or_alias: key,
            special_field: ScalarFieldSpecialSchemaField::from_schema_name(schema_name),
            value: self.transform_scalar_type(&field_type, None),
            conditional: false,
            concrete_type: None,
        }));
    }

    fn visit_condition(&mut self, type_selections: &mut Vec<TypeSelection>, condition: &Condition) {
        let mut selections = self.visit_selections(&condition.selections);
        for selection in selections.iter_mut() {
            selection.set_conditional(true);
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
            if let Some(concrete_type) = selection.get_enclosing_concrete_type() {
                by_concrete_type
                    .entry(concrete_type)
                    .or_insert_with(Vec::new)
                    .push(selection);
            } else {
                let key = selection.get_string_key();
                let key = TypeSelectionKey {
                    key,
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
                                typename_aliases.insert(selection.get_field_name_or_alias().expect(
                                "Just checked this exists by checking that the field is typename",
                            ));
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
                    .map(|typename_alias| {
                        Prop::KeyValuePair(KeyValuePairProp {
                            key: *typename_alias,
                            read_only: true,
                            optional: false,
                            value: AST::OtherTypename,
                        })
                    })
                    .collect(),
            );
        } else {
            let mut selection_map = selections_to_map(hashmap_into_values(base_fields), false);
            for concrete_type_selections in hashmap_into_values(by_concrete_type) {
                merge_selections(
                    &mut selection_map,
                    selections_to_map(
                        concrete_type_selections.into_iter().map(|mut sel| {
                            sel.set_conditional(true);
                            sel
                        }),
                        false,
                    ),
                    true,
                );
            }
            let selection_map_values = group_refs(hashmap_into_values(selection_map))
                .map(|sel| {
                    if let TypeSelection::ScalarField(ref scalar_field) = sel {
                        if sel.is_typename() {
                            if let Some(type_condition) = scalar_field.concrete_type {
                                let mut scalar_field = scalar_field.clone();
                                scalar_field.conditional = false;
                                return self.make_prop(
                                    TypeSelection::ScalarField(scalar_field),
                                    unmasked,
                                    Some(type_condition),
                                );
                            }
                        }
                    } else if let TypeSelection::LinkedField(ref linked_field) = sel {
                        if let Some(concrete_type) = linked_field.concrete_type {
                            let mut linked_field = linked_field.clone();
                            linked_field.concrete_type = None;
                            return self.make_prop(
                                TypeSelection::LinkedField(linked_field),
                                unmasked,
                                Some(concrete_type),
                            );
                        }
                    }

                    self.make_prop(sel, unmasked, None)
                })
                .collect();
            types.push(selection_map_values);
        }

        AST::Union(
            types
                .into_iter()
                .map(|mut props: Vec<Prop>| {
                    if let Some(fragment_type_name) = fragment_type_name {
                        props.push(Prop::KeyValuePair(KeyValuePairProp {
                            key: *KEY_FRAGMENT_TYPE,
                            optional: false,
                            read_only: true,
                            value: AST::FragmentReferenceType(fragment_type_name),
                        }));
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
            if let Some(concrete_type) = selection.get_enclosing_concrete_type() {
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
                let mut base_fields_map = base_fields_map.clone();
                merge_selections(
                    &mut base_fields_map,
                    selections_to_map(selections.into_iter(), false),
                    false,
                );
                let merged_selections: Vec<_> = hashmap_into_values(base_fields_map).collect();
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
        if let Some(module_import) = type_selections.iter().find_map(|sel| {
            if let TypeSelection::ModuleDirective(m) = sel {
                Some(m)
            } else {
                None
            }
        }) {
            self.runtime_imports.local_3d_payload = true;

            types.push(AST::Local3DPayload(
                module_import.document_name,
                Box::new(AST::ExactObject(
                    type_selections
                        .iter()
                        .filter(|sel| !sel.is_js_field())
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
        let is_updatable_operation = self.is_updatable_operation;
        let optional = type_selection.is_conditional();
        if is_updatable_operation && optional {
            panic!(
                "Within updatable operations, we should never generate optional fields! This indicates a bug in Relay. type_selection: {:?}",
                type_selection
            );
        }

        match type_selection {
            TypeSelection::LinkedField(linked_field) => {
                let linked_field_is_updatable =
                    is_updatable_operation && linked_field.contains_fragment_spread();
                let key = linked_field.field_name_or_alias;

                if linked_field_is_updatable {
                    // TODO check whether the field is `node` or `nodes` on `Query`. If so, it should not be
                    // updatable.

                    let (just_fragments, no_fragments) =
                        extract_fragments(linked_field.node_selections);

                    let getter_object_props =
                        self.selections_to_babel(no_fragments.into_iter(), unmasked, None);
                    let getter_return_value = self
                        .transform_scalar_type(&linked_field.node_type, Some(getter_object_props));

                    let mut setter_parameter =
                        AST::InexactObject(vec![Prop::KeyValuePair(KeyValuePairProp {
                            key: *KEY_FRAGMENT_SPREADS,
                            value: AST::Union(
                                just_fragments
                                    .iter()
                                    .map(|fragment| {
                                        AST::FragmentReferenceType(fragment.fragment_name)
                                    })
                                    .collect(),
                            ),
                            read_only: true,
                            optional: false,
                        })]);
                    if linked_field.node_type.is_list() {
                        setter_parameter = AST::ReadOnlyArray(Box::new(setter_parameter));
                    } else {
                        setter_parameter = AST::Nullable(Box::new(setter_parameter));
                    }

                    Prop::GetterSetterPair(GetterSetterPairProp {
                        key,
                        getter_return_value,
                        setter_parameter,
                    })
                } else {
                    let object_props = self.selections_to_babel(
                        hashmap_into_values(linked_field.node_selections),
                        unmasked,
                        None,
                    );
                    let value =
                        self.transform_scalar_type(&linked_field.node_type, Some(object_props));

                    Prop::KeyValuePair(KeyValuePairProp {
                        key,
                        value,
                        optional,
                        read_only: true,
                    })
                }
            }
            TypeSelection::ScalarField(scalar_field) => {
                if scalar_field.special_field == Some(ScalarFieldSpecialSchemaField::TypeName) {
                    if let Some(concrete_type) = concrete_type {
                        Prop::KeyValuePair(KeyValuePairProp {
                            key: scalar_field.field_name_or_alias,
                            value: AST::StringLiteral(self.schema.get_type_name(concrete_type)),
                            optional,
                            read_only: true,
                        })
                    } else {
                        Prop::KeyValuePair(KeyValuePairProp {
                            key: scalar_field.field_name_or_alias,
                            value: scalar_field.value,
                            optional,
                            read_only: true,
                        })
                    }
                } else {
                    Prop::KeyValuePair(KeyValuePairProp {
                        key: scalar_field.field_name_or_alias,
                        value: scalar_field.value,
                        optional,
                        // all fields outside of updatable operations are read-only, and within updatable operations,
                        // the typename field (handled above) and id fields are read-only.
                        read_only: !is_updatable_operation
                            || scalar_field.special_field
                                == Some(ScalarFieldSpecialSchemaField::Id),
                    })
                }
            }
            _ => panic!(
                "Unexpected TypeSelection variant in make_prop, {:?}",
                type_selection
            ),
        }
    }

    fn raw_response_make_prop(
        &mut self,
        type_selection: TypeSelection,
        concrete_type: Option<Type>,
    ) -> Prop {
        let optional = type_selection.is_conditional();
        match type_selection {
            TypeSelection::ModuleDirective(module_directive) => Prop::Spread(SpreadProp {
                value: module_directive.fragment_name,
            }),
            TypeSelection::LinkedField(linked_field) => {
                let node_type = linked_field.node_type;
                let inner_concrete_type = if node_type.is_list()
                    || node_type.is_non_null()
                    || node_type.inner().is_abstract_type()
                {
                    None
                } else {
                    Some(node_type.inner())
                };
                let object_props = self.raw_response_selections_to_babel(
                    hashmap_into_values(linked_field.node_selections),
                    inner_concrete_type,
                );
                Prop::KeyValuePair(KeyValuePairProp {
                    key: linked_field.field_name_or_alias,
                    value: self.transform_scalar_type(&node_type, Some(object_props)),
                    read_only: true,
                    optional,
                })
            }
            TypeSelection::ScalarField(scalar_field) => {
                if scalar_field.special_field == Some(ScalarFieldSpecialSchemaField::TypeName) {
                    if let Some(concrete_type) = concrete_type {
                        Prop::KeyValuePair(KeyValuePairProp {
                            key: scalar_field.field_name_or_alias,
                            value: AST::StringLiteral(self.schema.get_type_name(concrete_type)),
                            read_only: true,
                            optional,
                        })
                    } else {
                        Prop::KeyValuePair(KeyValuePairProp {
                            key: scalar_field.field_name_or_alias,
                            value: scalar_field.value,
                            read_only: true,
                            optional,
                        })
                    }
                } else {
                    Prop::KeyValuePair(KeyValuePairProp {
                        key: scalar_field.field_name_or_alias,
                        value: scalar_field.value,
                        read_only: true,
                        optional,
                    })
                }
            }
            TypeSelection::RawResponseFragmentSpread(f) => {
                Prop::Spread(SpreadProp { value: f.value })
            }
            _ => panic!(
                "Unexpected TypeSelection variant in raw_response_make_prop {:?}",
                type_selection
            ),
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
                &[self.writer.get_runtime_fragment_import(), LOCAL_3D_PAYLOAD],
                RELAY_RUNTIME,
            ),
            RuntimeImports {
                local_3d_payload: true,
                fragment_reference: false,
            } => self
                .writer
                .write_import_type(&[LOCAL_3D_PAYLOAD], RELAY_RUNTIME),
            RuntimeImports {
                local_3d_payload: false,
                fragment_reference: true,
            } => self
                .writer
                .write_import_type(&[self.writer.get_runtime_fragment_import()], RELAY_RUNTIME),
            RuntimeImports {
                local_3d_payload: false,
                fragment_reference: false,
            } => Ok(()),
        }
    }

    fn write_fragment_imports(&mut self) -> Result {
        for used_fragment in self.used_fragments.iter().sorted() {
            if !self.generated_fragments.contains(used_fragment) {
                let fragment_type_name = format!("{}$fragmentType", used_fragment);
                match self.js_module_format {
                    JsModuleFormat::CommonJS => {
                        self.writer.write_any_type_definition(&fragment_type_name)?;
                    }
                    JsModuleFormat::Haste => {
                        self.writer.write_import_fragment_type(
                            &[&fragment_type_name],
                            &format!("{}.graphql", used_fragment),
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
                .write_import_type(&[ACTOR_CHANGE_POINT], REACT_RELAY_MULTI_ACTOR)
        } else {
            Ok(())
        }
    }

    fn write_relay_resolver_imports(&mut self) -> Result {
        for (from, name) in self.imported_resolvers.iter().sorted() {
            self.writer
                .write_import_module_default(name.lookup(), from.lookup())?
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
                        .write_any_type_definition(imported_raw_response_type.lookup())?;
                }
                JsModuleFormat::Haste => {
                    self.writer.write_import_fragment_type(
                        &[imported_raw_response_type.lookup()],
                        &format!("{}.graphql", imported_raw_response_type),
                    )?;
                }
            }
        }

        Ok(())
    }

    fn write_enum_definitions(&mut self) -> Result {
        let mut enum_ids: Vec<_> = self.used_enums.iter().cloned().collect();
        enum_ids.sort_by_key(|enum_id| self.schema.enum_(*enum_id).name);
        for enum_id in enum_ids {
            let enum_type = self.schema.enum_(enum_id);
            if let Some(enum_module_suffix) = &self.typegen_config.enum_module_suffix {
                self.writer.write_import_type(
                    &[enum_type.name.lookup()],
                    &format!("{}{}", enum_type.name, enum_module_suffix),
                )?;
            } else {
                let mut members: Vec<AST> = enum_type
                    .values
                    .iter()
                    .map(|enum_value| AST::StringLiteral(enum_value.value))
                    .collect();

                if !self.typegen_config.flow_typegen.no_future_proof_enums {
                    members.push(AST::StringLiteral(*FUTURE_ENUM_VALUE));
                }

                self.writer
                    .write_export_type(enum_type.name.lookup(), &AST::Union(members))?;
            }
        }
        Ok(())
    }

    fn generate_input_variables_type(&mut self, node: &OperationDefinition) -> AST {
        AST::ExactObject(
            node.variable_definitions
                .iter()
                .map(|var_def| {
                    Prop::KeyValuePair(KeyValuePairProp {
                        key: var_def.name.item,
                        read_only: false,
                        optional: !var_def.type_.is_non_null(),
                        value: self.transform_input_type(&var_def.type_),
                    })
                })
                .collect(),
        )
    }

    fn write_input_object_types(&mut self) -> Result {
        for (type_identifier, input_object_type) in self.generated_input_object_types.iter() {
            match input_object_type {
                GeneratedInputObject::Resolved(input_object_type) => {
                    self.writer
                        .write_export_type(type_identifier.lookup(), input_object_type)?;
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
                            .map(|field| {
                                Prop::KeyValuePair(KeyValuePairProp {
                                    key: field.name,
                                    read_only: false,
                                    optional: !field.type_.is_non_null()
                                        || self
                                            .typegen_config
                                            .optional_input_fields
                                            .contains(&field.name),
                                    value: self.transform_input_type(&field.type_),
                                })
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
                    type_selections.push(TypeSelection::RawResponseFragmentSpread(
                        RawResponseFragmentSpread {
                            value: spread_type,
                            conditional: false,
                            concrete_type: None,
                        },
                    ))
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
enum TypeSelection {
    RawResponseFragmentSpread(RawResponseFragmentSpread),
    ModuleDirective(ModuleDirective),
    LinkedField(TypeSelectionLinkedField),
    ScalarField(TypeSelectionScalarField),
    InlineFragment(TypeSelectionInlineFragment),
    FragmentSpread(TypeSelectionFragmentSpread),
}

#[derive(Debug, Clone)]
struct RawResponseFragmentSpread {
    value: StringKey,
    conditional: bool,
    concrete_type: Option<Type>,
}

impl TypeSelection {
    fn set_concrete_type(&mut self, type_: Type) {
        match self {
            TypeSelection::LinkedField(l) => l.concrete_type = Some(type_),
            TypeSelection::ScalarField(s) => s.concrete_type = Some(type_),
            TypeSelection::InlineFragment(f) => f.concrete_type = Some(type_),
            TypeSelection::FragmentSpread(f) => f.concrete_type = Some(type_),
            TypeSelection::ModuleDirective(m) => m.concrete_type = Some(type_),
            TypeSelection::RawResponseFragmentSpread(f) => f.concrete_type = Some(type_),
        }
    }

    fn set_conditional(&mut self, conditional: bool) {
        match self {
            TypeSelection::LinkedField(l) => l.conditional = conditional,
            TypeSelection::ScalarField(s) => s.conditional = conditional,
            TypeSelection::InlineFragment(f) => f.conditional = conditional,
            TypeSelection::FragmentSpread(f) => f.conditional = conditional,
            TypeSelection::ModuleDirective(m) => m.conditional = conditional,
            TypeSelection::RawResponseFragmentSpread(f) => f.conditional = conditional,
        }
    }

    fn is_conditional(&self) -> bool {
        match self {
            TypeSelection::LinkedField(l) => l.conditional,
            TypeSelection::ScalarField(s) => s.conditional,
            TypeSelection::FragmentSpread(f) => f.conditional,
            TypeSelection::InlineFragment(f) => f.conditional,
            TypeSelection::ModuleDirective(m) => m.conditional,
            TypeSelection::RawResponseFragmentSpread(f) => f.conditional,
        }
    }

    fn get_enclosing_concrete_type(&self) -> Option<Type> {
        match self {
            TypeSelection::LinkedField(l) => l.concrete_type,
            TypeSelection::ScalarField(s) => s.concrete_type,
            TypeSelection::FragmentSpread(f) => f.concrete_type,
            TypeSelection::InlineFragment(f) => f.concrete_type,
            TypeSelection::ModuleDirective(m) => m.concrete_type,
            TypeSelection::RawResponseFragmentSpread(f) => f.concrete_type,
        }
    }

    fn is_typename(&self) -> bool {
        matches!(
            self,
            TypeSelection::ScalarField(TypeSelectionScalarField {
                special_field: Some(ScalarFieldSpecialSchemaField::TypeName),
                ..
            }),
        )
    }

    fn is_js_field(&self) -> bool {
        matches!(
            self,
            TypeSelection::ScalarField(TypeSelectionScalarField {
                special_field: Some(ScalarFieldSpecialSchemaField::JS),
                ..
            }),
        )
    }


    fn get_field_name_or_alias(&self) -> Option<StringKey> {
        match self {
            TypeSelection::LinkedField(l) => Some(l.field_name_or_alias),
            TypeSelection::ScalarField(s) => Some(s.field_name_or_alias),
            _ => None,
        }
    }

    fn get_string_key(&self) -> StringKey {
        match self {
            TypeSelection::LinkedField(l) => l.field_name_or_alias,
            TypeSelection::ScalarField(s) => s.field_name_or_alias,
            TypeSelection::FragmentSpread(i) => format!("__fragments_{}", i.fragment_name).intern(),
            TypeSelection::InlineFragment(i) => format!("__fragments_{}", i.fragment_name).intern(),
            TypeSelection::ModuleDirective(md) => md.fragment_name,
            TypeSelection::RawResponseFragmentSpread(_) => *SPREAD_KEY,
        }
    }
}

#[derive(Debug, Clone)]
struct ModuleDirective {
    fragment_name: StringKey,
    document_name: StringKey,
    conditional: bool,
    concrete_type: Option<Type>,
}

#[derive(Debug, Clone)]
struct TypeSelectionLinkedField {
    field_name_or_alias: StringKey,
    node_type: TypeReference,
    node_selections: TypeSelectionMap,
    conditional: bool,
    concrete_type: Option<Type>,
}

impl TypeSelectionLinkedField {
    fn contains_fragment_spread(&self) -> bool {
        self.node_selections
            .iter()
            .any(|(_, type_selection)| matches!(type_selection, TypeSelection::FragmentSpread(_)))
    }
}

#[derive(Debug, Clone)]
struct TypeSelectionScalarField {
    field_name_or_alias: StringKey,
    special_field: Option<ScalarFieldSpecialSchemaField>,
    value: AST,
    conditional: bool,
    concrete_type: Option<Type>,
}

#[derive(Debug, Clone)]
struct TypeSelectionInlineFragment {
    fragment_name: StringKey,
    conditional: bool,
    concrete_type: Option<Type>,
}

#[derive(Debug, Clone)]
struct TypeSelectionFragmentSpread {
    fragment_name: StringKey,
    conditional: bool,
    concrete_type: Option<Type>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum ScalarFieldSpecialSchemaField {
    JS,
    TypeName,
    Id,
}

impl ScalarFieldSpecialSchemaField {
    fn from_schema_name(key: StringKey) -> Option<Self> {
        if key == *JS_FIELD_NAME {
            Some(ScalarFieldSpecialSchemaField::JS)
        } else if key == *KEY_TYPENAME {
            Some(ScalarFieldSpecialSchemaField::TypeName)
        } else if key == *KEY_ID {
            Some(ScalarFieldSpecialSchemaField::Id)
        } else {
            None
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
        let both_are_conditional = a.is_conditional() && b.is_conditional();

        let mut new_type_selection = if let TypeSelection::LinkedField(mut lf_a) = a {
            if let TypeSelection::LinkedField(lf_b) = b {
                merge_selections(
                    &mut lf_a.node_selections,
                    lf_b.node_selections,
                    should_set_conditional,
                );
                TypeSelection::LinkedField(lf_a)
            } else {
                panic!(
                    "Invalid variants passed to merge_selection linked field a={:?} b={:?}",
                    lf_a, b
                )
            }
        } else if let TypeSelection::ScalarField(sf_a) = a {
            if let TypeSelection::ScalarField(_) = b {
                TypeSelection::ScalarField(sf_a)
            } else {
                panic!(
                    "Invalid variants passed to merge_selection scalar field a={:?} b={:?}",
                    sf_a, b
                )
            }
        } else {
            a
        };

        new_type_selection.set_conditional(both_are_conditional);
        new_type_selection
    } else if should_set_conditional {
        b.set_conditional(true);
        b
    } else {
        b
    }
}

fn merge_selections(a: &mut TypeSelectionMap, b: TypeSelectionMap, should_set_conditional: bool) {
    for (key, value) in b {
        a.insert(
            key,
            merge_selection(a.get(&key).cloned(), value, should_set_conditional),
        );
    }
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
        let selection_key = selection.get_string_key();
        let key = if append_type {
            TypeSelectionKey {
                key: selection_key,
                concrete_type: selection.get_enclosing_concrete_type(),
            }
        } else {
            TypeSelectionKey {
                key: selection_key,
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
    let mut fragment_spreads = None;
    let mut props = props.into_iter();
    std::iter::from_fn(move || {
        while let Some(prop) = props.next() {
            if let TypeSelection::FragmentSpread(inline_fragment) = prop {
                fragment_spreads
                    .get_or_insert_with(Vec::new)
                    .push(inline_fragment.fragment_name);
            } else if let TypeSelection::InlineFragment(inline_fragment) = prop {
                fragment_spreads
                    .get_or_insert_with(Vec::new)
                    .push(inline_fragment.fragment_name);
            } else {
                return Some(prop);
            }
        }
        if let Some(refs) = fragment_spreads.take() {
            return Some(TypeSelection::ScalarField(TypeSelectionScalarField {
                field_name_or_alias: *KEY_FRAGMENT_SPREADS,
                value: AST::FragmentReference(refs),
                special_field: None,
                conditional: false,
                concrete_type: None,
            }));
        }
        None
    })
}

fn hashmap_into_values<K: Hash + Eq, V>(map: IndexMap<K, V>) -> impl Iterator<Item = V> {
    map.into_iter().map(|(_, val)| val)
}

pub fn has_raw_response_type_directive(operation: &OperationDefinition) -> bool {
    operation
        .directives
        .named(*RAW_RESPONSE_TYPE_DIRECTIVE_NAME)
        .is_some()
}

fn has_fragment_spread(selections: &[Selection]) -> bool {
    selections.iter().any(|selection| match selection {
        Selection::FragmentSpread(_) => true,
        Selection::Condition(condition) => has_fragment_spread(&condition.selections),
        Selection::LinkedField(linked_field) => has_fragment_spread(&linked_field.selections),
        Selection::InlineFragment(inline_fragment) => {
            has_fragment_spread(&inline_fragment.selections)
        }
        Selection::ScalarField(_) => false,
    })
}

fn apply_required_directive_nullability(
    field_type: &TypeReference,
    directives: &[Directive],
) -> TypeReference {
    // We apply bubbling before the field's own @required directive (which may
    // negate the effects of bubbling) because we need handle the case where
    // null can bubble to the _items_ in a plural field which is itself
    // @required.
    let bubbled_type = match directives.named(*CHILDREN_CAN_BUBBLE_METADATA_KEY) {
        Some(_) => field_type.with_nullable_item_type(),
        None => field_type.clone(),
    };
    match directives.named(RequiredMetadataDirective::directive_name()) {
        Some(_) => bubbled_type.non_null(),
        None => bubbled_type,
    }
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

fn extract_fragments(
    all_selections: IndexMap<TypeSelectionKey, TypeSelection>,
) -> (Vec<TypeSelectionFragmentSpread>, Vec<TypeSelection>) {
    let mut fragments = Vec::with_capacity(all_selections.len());
    let mut non_fragments = Vec::with_capacity(all_selections.len());

    for (_, type_selection) in all_selections {
        match type_selection {
            TypeSelection::FragmentSpread(f) => {
                fragments.push(f);
            }
            _ => non_fragments.push(type_selection),
        }
    }

    (fragments, non_fragments)
}
