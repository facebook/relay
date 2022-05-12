/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod flow;
mod javascript;
mod typegen_state;
mod typescript;
mod visit;
mod write;
mod writer;

use ::intern::string_key::{Intern, StringKey};
use common::NamedItem;
use graphql_ir::{FragmentDefinition, OperationDefinition};
use indexmap::IndexMap;
use lazy_static::lazy_static;
use relay_config::{JsModuleFormat, ProjectConfig, SchemaConfig};
pub use relay_config::{TypegenConfig, TypegenLanguage};
use relay_transforms::{TypeConditionInfo, UPDATABLE_DIRECTIVE};
use schema::{SDLSchema, Type, TypeReference};
pub use write::has_raw_response_type_directive;
use write::{
    write_fragment_type_exports_section, write_operation_type_exports_section,
    write_split_operation_type_exports_section, write_validator_function,
};
use writer::{new_writer_from_config, AST};

static REACT_RELAY_MULTI_ACTOR: &str = "react-relay/multi-actor";
static RELAY_RUNTIME: &str = "relay-runtime";
static LOCAL_3D_PAYLOAD: &str = "Local3DPayload";
static ACTOR_CHANGE_POINT: &str = "ActorChangePoint";
pub static PROVIDED_VARIABLE_TYPE: &str = "ProvidedVariablesType";
static VALIDATOR_EXPORT_NAME: &str = "validate";

lazy_static! {
    static ref KEY_CLIENTID: StringKey = "__id".intern();
    pub(crate) static ref KEY_DATA: StringKey = "$data".intern();
    static ref KEY_FRAGMENT_SPREADS: StringKey = "$fragmentSpreads".intern();
    static ref KEY_UPDATABLE_FRAGMENT_SPREADS: StringKey = "$updatableFragmentSpreads".intern();
    pub(crate) static ref KEY_FRAGMENT_TYPE: StringKey = "$fragmentType".intern();
    static ref FRAGMENT_PROP_NAME: StringKey = "__fragmentPropName".intern();
    static ref FUTURE_ENUM_VALUE: StringKey = "%future added value".intern();
    static ref JS_FIELD_NAME: StringKey = "js".intern();
    static ref KEY_RAW_RESPONSE: StringKey = "rawResponse".intern();
    static ref KEY_TYPENAME: StringKey = "__typename".intern();
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

/// Determines whether a generated data type is "unmasked", which controls whether
/// the generated AST objects are exact (e.g. `{| foo: Foo |}`) or inexact
/// (e.g. `{ foo: Foo, ... }`).
///
/// The $data type of a fragment definition with the `@relay(mask: false)` directive
/// is unmasked, i.e. inexact. Fragments without this directive and queries are
/// masked, i.e. exact.
///
/// # Why?
///
/// * An unmasked fragment definition is meant to be used with an unmasked fragment
///   spread, though this is not enforced.
/// * An unmasked fragment spread "inlines" the child type into the parent type.
///   This occurs in the transforms pipeline, before hitting the typegen.
/// * An unmasked child fragment can be spread in multiple different fragments.
/// * Functions/components that accept a read-out unmasked fragment will receive
///   an object with the child fragment's fields and the parent fragment's fields.
/// * These parent fields can vary, depending on where the child fragment was spread.
/// * So, the type of the child fragment must be inexact, to account for the fact
///   that we don't know the parent's fields.
/// * We could theoretically emit exact types for children that are only spread in
///   a single parent, which itself is non-masked, as in those cases, we would know
///   all of the fields that are present. However, we do not want to do this, as we
///   do not want the child component to depend (even implicitly or accidentally) on
///   the fields selected by the parent.
/// * Obviously, unmasked child fragments do receive their parents fields, hence
///   `@relay(mask: false)` is discouraged in favor of `@inline`.
#[derive(Copy, Clone, Eq, PartialEq)]
enum MaskStatus {
    Unmasked,
    Masked,
}

pub fn generate_fragment_type_exports_section(
    fragment_definition: &FragmentDefinition,
    schema: &SDLSchema,
    project_config: &ProjectConfig,
) -> String {
    let typegen_options = TypegenOptions::new(
        schema,
        &project_config.schema_config,
        project_config.js_module_format,
        project_config.output.is_some(),
        &project_config.typegen_config,
        fragment_definition
            .directives
            .named(*UPDATABLE_DIRECTIVE)
            .is_some(),
    );
    let mut writer = new_writer_from_config(&project_config.typegen_config);
    write_fragment_type_exports_section(&typegen_options, fragment_definition, &mut writer)
        .unwrap();
    writer.into_string()
}

pub fn generate_named_validator_export(
    fragment_definition: &FragmentDefinition,
    schema: &SDLSchema,
    project_config: &ProjectConfig,
) -> String {
    let typegen_options = TypegenOptions::new(
        schema,
        &project_config.schema_config,
        project_config.js_module_format,
        project_config.output.is_some(),
        &project_config.typegen_config,
        fragment_definition
            .directives
            .named(*UPDATABLE_DIRECTIVE)
            .is_some(),
    );
    let mut writer = new_writer_from_config(&project_config.typegen_config);
    write_validator_function(&typegen_options, fragment_definition, &mut writer).unwrap();
    let validator_function_body = writer.into_string();

    if project_config.typegen_config.eager_es_modules {
        format!("export {}", validator_function_body)
    } else {
        format!(
            "module.exports.{} = {};",
            VALIDATOR_EXPORT_NAME, validator_function_body
        )
    }
}

pub fn generate_operation_type_exports_section(
    typegen_operation: &OperationDefinition,
    normalization_operation: &OperationDefinition,
    schema: &SDLSchema,
    project_config: &ProjectConfig,
) -> String {
    let typegen_options = TypegenOptions::new(
        schema,
        &project_config.schema_config,
        project_config.js_module_format,
        project_config.output.is_some(),
        &project_config.typegen_config,
        typegen_operation
            .directives
            .named(*UPDATABLE_DIRECTIVE)
            .is_some(),
    );
    let mut writer = new_writer_from_config(&project_config.typegen_config);
    write_operation_type_exports_section(
        &typegen_options,
        typegen_operation,
        normalization_operation,
        &mut writer,
    )
    .unwrap();
    writer.into_string()
}

pub fn generate_split_operation_type_exports_section(
    typegen_operation: &OperationDefinition,
    normalization_operation: &OperationDefinition,
    schema: &SDLSchema,
    project_config: &ProjectConfig,
) -> String {
    let typegen_options = TypegenOptions::new(
        schema,
        &project_config.schema_config,
        project_config.js_module_format,
        project_config.output.is_some(),
        &project_config.typegen_config,
        typegen_operation
            .directives
            .named(*UPDATABLE_DIRECTIVE)
            .is_some(),
    );
    let mut writer = new_writer_from_config(&project_config.typegen_config);

    write_split_operation_type_exports_section(
        &typegen_options,
        typegen_operation,
        normalization_operation,
        &mut writer,
    )
    .unwrap();
    writer.into_string()
}

/// An immutable grab bag of configuration, etc. for type generation.
struct TypegenOptions<'a> {
    schema: &'a SDLSchema,
    schema_config: &'a SchemaConfig,
    typegen_config: &'a TypegenConfig,
    js_module_format: JsModuleFormat,
    has_unified_output: bool,
    generating_updatable_types: bool,
}

impl<'a> TypegenOptions<'a> {
    fn new(
        schema: &'a SDLSchema,
        schema_config: &'a SchemaConfig,
        js_module_format: JsModuleFormat,
        has_unified_output: bool,
        typegen_config: &'a TypegenConfig,
        generating_updatable_types: bool,
    ) -> Self {
        Self {
            schema,
            schema_config,
            js_module_format,
            has_unified_output,
            typegen_config,
            generating_updatable_types,
        }
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
    // Why are we using TypeSelectionInfo instead of re-using concrete_type?
    // Because concrete_type is poorly named and does not refer to the concrete
    // type of the fragment spread.
    type_condition_info: Option<TypeConditionInfo>,
    is_updatable_fragment_spread: bool,
}

type TypeSelectionMap = IndexMap<TypeSelectionKey, TypeSelection>;

#[derive(Eq, Hash, PartialEq, Clone, Copy, Debug)]
struct TypeSelectionKey {
    key: StringKey,
    concrete_type: Option<Type>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum ScalarFieldSpecialSchemaField {
    JS,
    TypeName,
    Id,
    ClientId,
}

impl ScalarFieldSpecialSchemaField {
    fn from_schema_name(key: StringKey, schema_config: &SchemaConfig) -> Option<Self> {
        if key == *JS_FIELD_NAME {
            Some(ScalarFieldSpecialSchemaField::JS)
        } else if key == *KEY_TYPENAME {
            Some(ScalarFieldSpecialSchemaField::TypeName)
        } else if key == *KEY_CLIENTID {
            Some(ScalarFieldSpecialSchemaField::ClientId)
        } else if key == schema_config.node_interface_id_field {
            Some(ScalarFieldSpecialSchemaField::Id)
        } else {
            None
        }
    }
}
