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
mod type_selection;
mod typegen_state;
mod typescript;
mod visit;
mod write;
mod writer;

use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use common::DirectiveName;
use common::NamedItem;
use common::ScalarName;
use common::WithLocation;
use graphql_ir::FragmentDefinition;
use graphql_ir::OperationDefinition;
use lazy_static::lazy_static;
use relay_config::ProjectConfig;
pub use relay_config::TypegenConfig;
pub use relay_config::TypegenLanguage;
use relay_transforms::UPDATABLE_DIRECTIVE;
use schema::SDLSchema;
pub use typegen_state::FragmentLocations;
pub use write::has_raw_response_type_directive;
use write::write_fragment_type_exports_section;
use write::write_operation_type_exports_section;
use write::write_split_operation_type_exports_section;
use write::write_validator_function;
use writer::new_writer_from_config;

static REACT_RELAY_MULTI_ACTOR: &str = "react-relay/multi-actor";
static RELAY_RUNTIME: &str = "relay-runtime";
static LOCAL_3D_PAYLOAD: &str = "Local3DPayload";
static ACTOR_CHANGE_POINT: &str = "ActorChangePoint";
static VALIDATOR_EXPORT_NAME: &str = "validate";
static LIVE_RESOLVERS_LIVE_STATE: &str = "LiveState";

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
    static ref KEY_DATA_ID: StringKey = "DataID".intern();
    static ref KEY_NODE: StringKey = "node".intern();
    static ref KEY_NODES: StringKey = "nodes".intern();
    static ref MODULE_COMPONENT: StringKey = "__module_component".intern();
    static ref RAW_RESPONSE_TYPE_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("raw_response_type".intern());
    static ref RESPONSE: StringKey = "response".intern();
    static ref TYPE_BOOLEAN: ScalarName = ScalarName("Boolean".intern());
    static ref TYPE_FLOAT: ScalarName = ScalarName("Float".intern());
    static ref TYPE_ID: ScalarName = ScalarName("ID".intern());
    static ref TYPE_INT: ScalarName = ScalarName("Int".intern());
    static ref TYPE_STRING: ScalarName = ScalarName("String".intern());
    static ref VARIABLES: StringKey = "variables".intern();
    static ref SPREAD_KEY: StringKey = "\0SPREAD".intern();
    static ref RESULT_TYPE_NAME: StringKey = "Result".intern();
    static ref LIVE_STATE_TYPE: StringKey = "LiveState".intern();
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
pub(crate) enum MaskStatus {
    Unmasked,
    Masked,
}

pub fn generate_fragment_type_exports_section_from_extra_artifact(
    fragment_definition: &FragmentDefinition,
    schema: &SDLSchema,
    project_config: &ProjectConfig,
    fragment_locations: &FragmentLocations,
) -> String {
    generate_fragment_type_exports_section_impl(
        fragment_definition,
        schema,
        project_config,
        fragment_locations,
        true,
    )
}

pub fn generate_fragment_type_exports_section(
    fragment_definition: &FragmentDefinition,
    schema: &SDLSchema,
    project_config: &ProjectConfig,
    fragment_locations: &FragmentLocations,
) -> String {
    generate_fragment_type_exports_section_impl(
        fragment_definition,
        schema,
        project_config,
        fragment_locations,
        false,
    )
}

fn generate_fragment_type_exports_section_impl(
    fragment_definition: &FragmentDefinition,
    schema: &SDLSchema,
    project_config: &ProjectConfig,
    fragment_locations: &FragmentLocations,
    is_extra_artifact_branch_module: bool,
) -> String {
    let typegen_context = TypegenContext::new(
        schema,
        project_config,
        fragment_definition
            .directives
            .named(*UPDATABLE_DIRECTIVE)
            .is_some(),
        fragment_definition.name.map(|x| x.0),
        fragment_locations,
        TypegenOptions {
            no_optional_fields_in_raw_response_type: false,
            is_extra_artifact_branch_module,
        },
    );
    let mut writer = new_writer_from_config(&project_config.typegen_config);
    write_fragment_type_exports_section(&typegen_context, fragment_definition, &mut writer)
        .unwrap();
    writer.into_string()
}

pub fn generate_named_validator_export(
    fragment_definition: &FragmentDefinition,
    schema: &SDLSchema,
    project_config: &ProjectConfig,
    fragment_locations: &FragmentLocations,
) -> String {
    let typegen_context = TypegenContext::new(
        schema,
        project_config,
        fragment_definition
            .directives
            .named(*UPDATABLE_DIRECTIVE)
            .is_some(),
        fragment_definition.name.map(|x| x.0),
        fragment_locations,
        TypegenOptions {
            no_optional_fields_in_raw_response_type: false,
            is_extra_artifact_branch_module: false,
        },
    );
    let mut writer = new_writer_from_config(&project_config.typegen_config);
    write_validator_function(&typegen_context, fragment_definition, &mut writer).unwrap();
    let validator_function_body = writer.into_string();

    if project_config.typegen_config.eager_es_modules {
        format!("export {validator_function_body}")
    } else {
        format!("module.exports.{VALIDATOR_EXPORT_NAME} = {validator_function_body};")
    }
}

pub fn generate_operation_type_exports_section(
    typegen_operation: &OperationDefinition,
    normalization_operation: &OperationDefinition,
    schema: &SDLSchema,
    project_config: &ProjectConfig,
    fragment_locations: &FragmentLocations,
    maybe_provided_variables: Option<String>,
) -> String {
    let typegen_context = TypegenContext::new(
        schema,
        project_config,
        typegen_operation
            .directives
            .named(*UPDATABLE_DIRECTIVE)
            .is_some(),
        WithLocation::new(
            typegen_operation.name.location,
            typegen_operation.name.item.0,
        ),
        fragment_locations,
        TypegenOptions {
            no_optional_fields_in_raw_response_type: false,
            is_extra_artifact_branch_module: false,
        },
    );
    let mut writer = new_writer_from_config(&project_config.typegen_config);
    write_operation_type_exports_section(
        &typegen_context,
        typegen_operation,
        normalization_operation,
        &mut writer,
        maybe_provided_variables,
    )
    .unwrap();
    writer.into_string()
}

pub fn generate_split_operation_type_exports_section(
    typegen_operation: &OperationDefinition,
    normalization_operation: &OperationDefinition,
    schema: &SDLSchema,
    project_config: &ProjectConfig,
    fragment_locations: &FragmentLocations,
    no_optional_fields_in_raw_response_type: bool,
) -> String {
    let typegen_context = TypegenContext::new(
        schema,
        project_config,
        typegen_operation
            .directives
            .named(*UPDATABLE_DIRECTIVE)
            .is_some(),
        WithLocation::new(
            typegen_operation.name.location,
            typegen_operation.name.item.0,
        ),
        fragment_locations,
        TypegenOptions {
            no_optional_fields_in_raw_response_type,
            is_extra_artifact_branch_module: false,
        },
    );
    let mut writer = new_writer_from_config(&project_config.typegen_config);

    write_split_operation_type_exports_section(
        &typegen_context,
        typegen_operation,
        normalization_operation,
        &mut writer,
    )
    .unwrap();
    writer.into_string()
}

/// An immutable grab bag of configuration, etc. for type generation.
/// A new `TypegenContext` is created for each operation, fragment, and so on.
struct TypegenContext<'a> {
    schema: &'a SDLSchema,
    project_config: &'a ProjectConfig,
    fragment_locations: &'a FragmentLocations,
    has_unified_output: bool,
    generating_updatable_types: bool,
    definition_source_location: WithLocation<StringKey>,
    typegen_options: TypegenOptions,
}

impl<'a> TypegenContext<'a> {
    fn new(
        schema: &'a SDLSchema,
        project_config: &'a ProjectConfig,
        generating_updatable_types: bool,
        definition_source_location: WithLocation<StringKey>,
        fragment_locations: &'a FragmentLocations,
        typegen_options: TypegenOptions,
    ) -> Self {
        Self {
            schema,
            project_config,
            fragment_locations,
            has_unified_output: project_config.output.is_some(),
            generating_updatable_types,
            definition_source_location,
            typegen_options,
        }
    }
}

struct TypegenOptions {
    // All keys in raw response should be required
    no_optional_fields_in_raw_response_type: bool,
    // Some extra artifacts require special type generation
    is_extra_artifact_branch_module: bool,
}
