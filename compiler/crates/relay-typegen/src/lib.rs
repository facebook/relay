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
mod writer;

use ::intern::{
    intern,
    string_key::{Intern, StringKey},
};
use common::NamedItem;
use flow::FlowPrinter;
use graphql_ir::{
    Condition, Directive, FragmentDefinition, FragmentSpread, InlineFragment, LinkedField,
    OperationDefinition, ProvidedVariableMetadata, ScalarField, Selection,
};
use indexmap::{map::Entry, IndexMap, IndexSet};
use itertools::Itertools;
use javascript::JavaScriptPrinter;
use lazy_static::lazy_static;
use relay_config::{JsModuleFormat, ProjectConfig, SchemaConfig};
pub use relay_config::{TypegenConfig, TypegenLanguage};
use relay_transforms::{
    FragmentAliasMetadata, ModuleMetadata, RefetchableDerivedFromMetadata, RefetchableMetadata,
    RelayDirective, RelayResolverSpreadMetadata, RequiredMetadataDirective, TypeConditionInfo,
    ASSIGNABLE_DIRECTIVE, ASSIGNABLE_DIRECTIVE_FOR_TYPEGEN, CHILDREN_CAN_BUBBLE_METADATA_KEY,
    CLIENT_EXTENSION_DIRECTIVE_NAME, NO_INLINE_DIRECTIVE_NAME,
    RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN, UPDATABLE_DIRECTIVE, UPDATABLE_DIRECTIVE_FOR_TYPEGEN,
};
use schema::{EnumID, SDLSchema, ScalarID, Schema, Type, TypeReference};
use std::{fmt::Result as FmtResult, hash::Hash, path::Path};
use typegen_state::*;
use typescript::TypeScriptPrinter;
use writer::{
    ExactObject, GetterSetterPairProp, InexactObject, KeyValuePairProp, Prop, SortedASTList,
    SortedStringKeyList, SpreadProp, StringLiteral, Writer, AST,
};

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
    let mut generator = TypeGenerator::new(
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
    generator
        .write_fragment_type_exports_section(fragment_definition)
        .unwrap();
    generator.into_string()
}

pub fn generate_named_validator_export(
    fragment_definition: &FragmentDefinition,
    schema: &SDLSchema,
    project_config: &ProjectConfig,
) -> String {
    let mut generator = TypeGenerator::new(
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
    generator
        .write_validator_function(fragment_definition, schema)
        .unwrap();
    let validator_function_body = generator.into_string();

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
    let mut generator = TypeGenerator::new(
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
    generator
        .write_operation_type_exports_section(typegen_operation, normalization_operation)
        .unwrap();
    generator.into_string()
}

pub fn generate_split_operation_type_exports_section(
    typegen_operation: &OperationDefinition,
    normalization_operation: &OperationDefinition,
    schema: &SDLSchema,
    project_config: &ProjectConfig,
) -> String {
    let mut generator = TypeGenerator::new(
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
    generator
        .write_split_operation_type_exports_section(typegen_operation, normalization_operation)
        .unwrap();
    generator.into_string()
}

struct TypeGenerator<'a> {
    schema: &'a SDLSchema,
    schema_config: &'a SchemaConfig,
    typegen_config: &'a TypegenConfig,
    js_module_format: JsModuleFormat,
    has_unified_output: bool,
    writer: Box<dyn Writer>,
    generating_updatable_types: bool,
}
impl<'a> TypeGenerator<'a> {
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
            writer: match &typegen_config.language {
                TypegenLanguage::JavaScript => Box::new(JavaScriptPrinter::default()),
                TypegenLanguage::Flow => Box::new(FlowPrinter::new()),
                TypegenLanguage::TypeScript => Box::new(TypeScriptPrinter::new(typegen_config)),
            },
            generating_updatable_types,
        }
    }

    fn into_string(self) -> String {
        self.writer.into_string()
    }

    fn write_operation_type_exports_section(
        &mut self,
        typegen_operation: &OperationDefinition,
        normalization_operation: &OperationDefinition,
    ) -> FmtResult {
        let mut encountered_enums = Default::default();
        let mut encountered_fragments = Default::default();
        let mut imported_resolvers = Default::default();
        let mut actor_change_status = ActorChangeStatus::NoActorChange;
        let mut runtime_imports = Default::default();
        let type_selections = self.visit_selections(
            &typegen_operation.selections,
            &mut encountered_enums,
            &mut encountered_fragments,
            &mut imported_resolvers,
            &mut actor_change_status,
        );
        let mut imported_raw_response_types = Default::default();
        let data_type = self.get_data_type(
            type_selections.into_iter(),
            MaskStatus::Masked, // Queries are never unmasked
            None,
            typegen_operation
                .directives
                .named(*CHILDREN_CAN_BUBBLE_METADATA_KEY)
                .is_some(),
            false, // Query types can never be plural
            &mut encountered_enums,
            &mut encountered_fragments,
        );

        let raw_response_type_and_match_fields =
            if has_raw_response_type_directive(normalization_operation) {
                let mut match_fields = Default::default();
                let raw_response_selections = self.raw_response_visit_selections(
                    &normalization_operation.selections,
                    &mut encountered_enums,
                    &mut match_fields,
                    &mut encountered_fragments,
                    &mut imported_raw_response_types,
                    &mut runtime_imports,
                );
                Some((
                    self.raw_response_selections_to_babel(
                        raw_response_selections.into_iter(),
                        None,
                        &mut encountered_enums,
                        &mut runtime_imports,
                    ),
                    match_fields,
                ))
            } else {
                None
            };

        let refetchable_fragment_name =
            RefetchableDerivedFromMetadata::find(&typegen_operation.directives);
        if refetchable_fragment_name.is_some() {
            runtime_imports.generic_fragment_type_should_be_imported = true;
        }

        // Always include 'FragmentRef' for typescript codegen for operations that have fragment spreads
        if self.typegen_config.language == TypegenLanguage::TypeScript
            && has_fragment_spread(&typegen_operation.selections)
        {
            runtime_imports.generic_fragment_type_should_be_imported = true;
        }

        self.write_import_actor_change_point(actor_change_status)?;
        runtime_imports.write_runtime_imports(&mut self.writer)?;
        self.write_fragment_imports(None, encountered_fragments)?;
        self.write_relay_resolver_imports(imported_resolvers)?;
        self.write_split_raw_response_type_imports(imported_raw_response_types)?;

        let (input_variables_type, input_object_types) =
            self.get_input_variables_type(typegen_operation, &mut encountered_enums);

        self.write_enum_definitions(encountered_enums)?;
        self.write_input_object_types(input_object_types)?;

        let variables_identifier = format!("{}$variables", typegen_operation.name.item);
        let variables_identifier_key = variables_identifier.as_str().intern();

        self.writer
            .write_export_type(&variables_identifier, &input_variables_type.into())?;

        let response_identifier = format!("{}$data", typegen_operation.name.item);
        let response_identifier_key = response_identifier.as_str().intern();
        self.writer
            .write_export_type(&response_identifier, &data_type)?;

        let query_wrapper_type = self.get_operation_type_export(
            raw_response_type_and_match_fields,
            typegen_operation,
            variables_identifier_key,
            response_identifier_key,
        )?;
        self.writer.write_export_type(
            typegen_operation.name.item.lookup(),
            &query_wrapper_type.into(),
        )?;

        // Note: this is a "bug", though in practice probably affects nothing.
        // We pass an unused InputObjectTypes, which is mutated by some of the nested calls.
        // However, we never end up using this. Pre-cleanup:
        // - self.generated_input_object_types was used in write_input_object_types (above)
        // - generate_provided_variables_type would nonetheless mutate this field
        //
        // Likewise, there is the same bug withencountered_enums
        self.generate_provided_variables_type(
            normalization_operation,
            &mut Default::default(),
            &mut Default::default(),
        )?;
        Ok(())
    }

    /// Returns the type of the generated query. This is the type parameter that you would have
    /// passed to useLazyLoadQuery before we inferred types from queries.
    /// Example:
    /// {| response: MyQuery$data, variables: MyQuery$variables |}
    fn get_operation_type_export(
        &mut self,
        raw_response_type_and_match_fields: Option<(AST, MatchFields)>,
        typegen_operation: &OperationDefinition,
        variables_identifier_key: StringKey,
        response_identifier_key: StringKey,
    ) -> Result<ExactObject, std::fmt::Error> {
        let mut operation_types = vec![
            Prop::KeyValuePair(KeyValuePairProp {
                key: *VARIABLES,
                read_only: false,
                optional: false,
                value: AST::Identifier(variables_identifier_key),
            }),
            Prop::KeyValuePair(KeyValuePairProp {
                key: *RESPONSE,
                read_only: false,
                optional: false,
                value: AST::Identifier(response_identifier_key),
            }),
        ];
        if let Some((raw_response_type, match_fields)) = raw_response_type_and_match_fields {
            for (key, ast) in match_fields.0 {
                self.writer.write_export_type(key.lookup(), &ast)?;
            }
            let raw_response_identifier = format!("{}$rawResponse", typegen_operation.name.item);
            self.writer
                .write_export_type(&raw_response_identifier, &raw_response_type)?;

            operation_types.push(Prop::KeyValuePair(KeyValuePairProp {
                key: *KEY_RAW_RESPONSE,
                read_only: false,
                optional: false,
                value: AST::Identifier(raw_response_identifier.intern()),
            }));
        }

        Ok(ExactObject::new(operation_types))
    }

    fn write_split_operation_type_exports_section(
        &mut self,
        typegen_operation: &OperationDefinition,
        normalization_operation: &OperationDefinition,
    ) -> FmtResult {
        let mut encountered_enums = Default::default();
        let mut match_fields = Default::default();
        let mut encountered_fragments = Default::default();
        let mut imported_raw_response_types = Default::default();
        let mut runtime_imports = Default::default();

        let raw_response_selections = self.raw_response_visit_selections(
            &normalization_operation.selections,
            &mut encountered_enums,
            &mut match_fields,
            &mut encountered_fragments,
            &mut imported_raw_response_types,
            &mut runtime_imports,
        );
        let raw_response_type = self.raw_response_selections_to_babel(
            raw_response_selections.into_iter(),
            None,
            &mut encountered_enums,
            &mut runtime_imports,
        );

        runtime_imports.write_runtime_imports(&mut self.writer)?;
        self.write_fragment_imports(None, encountered_fragments)?;
        self.write_split_raw_response_type_imports(imported_raw_response_types)?;

        self.write_enum_definitions(encountered_enums)?;

        for (key, ast) in match_fields.0 {
            self.writer.write_export_type(key.lookup(), &ast)?;
        }

        self.writer
            .write_export_type(typegen_operation.name.item.lookup(), &raw_response_type)?;

        Ok(())
    }

    fn write_fragment_type_exports_section(
        &mut self,
        fragment_definition: &FragmentDefinition,
    ) -> FmtResult {
        // Assignable fragments do not require $data and $ref type exports, and their aliases
        let is_assignable_fragment = fragment_definition
            .directives
            .named(*ASSIGNABLE_DIRECTIVE)
            .is_some();

        let mut encountered_enums = Default::default();
        let mut encountered_fragments = Default::default();
        let mut imported_resolvers = Default::default();
        let mut actor_change_status = ActorChangeStatus::NoActorChange;
        let mut type_selections = self.visit_selections(
            &fragment_definition.selections,
            &mut encountered_enums,
            &mut encountered_fragments,
            &mut imported_resolvers,
            &mut actor_change_status,
        );
        if !fragment_definition.type_condition.is_abstract_type() {
            let num_concrete_selections = type_selections
                .iter()
                .filter(|sel| sel.get_enclosing_concrete_type().is_some())
                .count();
            if num_concrete_selections <= 1 {
                for selection in type_selections.iter_mut().filter(|sel| sel.is_typename()) {
                    selection.set_concrete_type(fragment_definition.type_condition);
                }
            }
        }

        let data_type = fragment_definition.name.item;
        let data_type_name = format!("{}$data", data_type);

        let ref_type_data_property = Prop::KeyValuePair(KeyValuePairProp {
            key: *KEY_DATA,
            optional: true,
            read_only: true,
            value: AST::Identifier(data_type_name.as_str().intern()),
        });
        let fragment_name = fragment_definition.name.item;
        let ref_type_fragment_spreads_property = Prop::KeyValuePair(KeyValuePairProp {
            key: if self.generating_updatable_types {
                *KEY_UPDATABLE_FRAGMENT_SPREADS
            } else {
                *KEY_FRAGMENT_SPREADS
            },
            optional: false,
            read_only: true,
            value: AST::FragmentReference(SortedStringKeyList::new(vec![fragment_name])),
        });
        let is_plural_fragment = is_plural(fragment_definition);
        let mut ref_type = AST::InexactObject(InexactObject::new(vec![
            ref_type_data_property,
            ref_type_fragment_spreads_property,
        ]));
        if is_plural_fragment {
            ref_type = AST::ReadOnlyArray(Box::new(ref_type));
        }

        let mask_status = if RelayDirective::is_unmasked_fragment_definition(fragment_definition) {
            MaskStatus::Unmasked
        } else {
            MaskStatus::Masked
        };

        let data_type = self.get_data_type(
            type_selections.into_iter(),
            mask_status,
            if mask_status == MaskStatus::Unmasked {
                None
            } else {
                Some(fragment_name)
            },
            fragment_definition
                .directives
                .named(*CHILDREN_CAN_BUBBLE_METADATA_KEY)
                .is_some(),
            is_plural_fragment,
            &mut encountered_enums,
            &mut encountered_fragments,
        );

        let runtime_imports = RuntimeImports {
            generic_fragment_type_should_be_imported: true,
            ..Default::default()
        };
        self.write_import_actor_change_point(actor_change_status)?;
        self.write_fragment_imports(Some(fragment_definition.name.item), encountered_fragments)?;

        self.write_enum_definitions(encountered_enums)?;

        runtime_imports.write_runtime_imports(&mut self.writer)?;
        self.write_relay_resolver_imports(imported_resolvers)?;

        let refetchable_metadata = RefetchableMetadata::find(&fragment_definition.directives);
        let fragment_type_name = format!("{}$fragmentType", fragment_name);
        self.writer
            .write_export_fragment_type(&fragment_type_name)?;
        if let Some(refetchable_metadata) = refetchable_metadata {
            let variables_name = format!("{}$variables", refetchable_metadata.operation_name);
            match self.js_module_format {
                JsModuleFormat::CommonJS => {
                    if self.has_unified_output {
                        self.writer.write_import_fragment_type(
                            &[&variables_name],
                            &format!("./{}.graphql", refetchable_metadata.operation_name),
                        )?;
                    } else {
                        self.writer.write_any_type_definition(&variables_name)?;
                    }
                }
                JsModuleFormat::Haste => {
                    self.writer.write_import_fragment_type(
                        &[&variables_name],
                        &format!("{}.graphql", refetchable_metadata.operation_name),
                    )?;
                }
            }
        }

        if !is_assignable_fragment {
            self.writer.write_export_type(&data_type_name, &data_type)?;
            self.writer
                .write_export_type(&format!("{}$key", fragment_definition.name.item), &ref_type)?;
        }

        Ok(())
    }

    fn visit_selections(
        &self,
        selections: &[Selection],
        encountered_enums: &mut EncounteredEnums,
        encountered_fragments: &mut EncounteredFragments,
        imported_resolvers: &mut ImportedResolvers,
        actor_change_status: &mut ActorChangeStatus,
    ) -> Vec<TypeSelection> {
        let mut type_selections = Vec::new();
        for selection in selections {
            match selection {
                Selection::FragmentSpread(fragment_spread) => self.visit_fragment_spread(
                    &mut type_selections,
                    fragment_spread,
                    encountered_fragments,
                    imported_resolvers,
                ),
                Selection::InlineFragment(inline_fragment) => self.visit_inline_fragment(
                    &mut type_selections,
                    inline_fragment,
                    encountered_enums,
                    encountered_fragments,
                    imported_resolvers,
                    actor_change_status,
                ),
                Selection::LinkedField(linked_field) => {
                    self.gen_visit_linked_field(&mut type_selections, linked_field, |selections| {
                        self.visit_selections(
                            selections,
                            encountered_enums,
                            encountered_fragments,
                            imported_resolvers,
                            actor_change_status,
                        )
                    })
                }
                Selection::ScalarField(scalar_field) => {
                    self.visit_scalar_field(&mut type_selections, scalar_field, encountered_enums)
                }
                Selection::Condition(condition) => self.visit_condition(
                    &mut type_selections,
                    condition,
                    encountered_enums,
                    encountered_fragments,
                    imported_resolvers,
                    actor_change_status,
                ),
            }
        }
        type_selections
    }

    fn visit_fragment_spread(
        &self,
        type_selections: &mut Vec<TypeSelection>,
        fragment_spread: &FragmentSpread,
        encountered_fragments: &mut EncounteredFragments,
        imported_resolvers: &mut ImportedResolvers,
    ) {
        if let Some(resolver_spread_metadata) =
            RelayResolverSpreadMetadata::find(&fragment_spread.directives)
        {
            self.visit_relay_resolver_fragment(
                type_selections,
                resolver_spread_metadata,
                RequiredMetadataDirective::find(&fragment_spread.directives).is_some(),
                imported_resolvers,
            );
        } else {
            let name = fragment_spread.fragment.item;
            encountered_fragments.0.insert(name);

            let spread_selection = TypeSelection::FragmentSpread(TypeSelectionFragmentSpread {
                fragment_name: name,
                conditional: false,
                concrete_type: None,
                type_condition_info: get_type_condition_info(fragment_spread),
                is_updatable_fragment_spread: fragment_spread
                    .directives
                    .named(*UPDATABLE_DIRECTIVE_FOR_TYPEGEN)
                    .is_some(),
            });

            let selection = if let Some(fragment_alias_metadata) =
                FragmentAliasMetadata::find(&fragment_spread.directives)
            {
                // We will model the types as a linked filed containing just the fragment spread.
                TypeSelection::LinkedField(TypeSelectionLinkedField {
                    field_name_or_alias: fragment_alias_metadata.alias.item,
                    // If/when @required is supported here, we would apply that to this type reference.
                    // TODO: What about plural fragments, is that just handled by the parent?
                    node_type: TypeReference::Named(fragment_alias_metadata.selection_type),
                    node_selections: selections_to_map(vec![spread_selection].into_iter(), true),
                    conditional: false,
                    concrete_type: None,
                })
            } else {
                spread_selection
            };
            type_selections.push(selection);
        }
    }

    fn visit_relay_resolver_fragment(
        &self,
        type_selections: &mut Vec<TypeSelection>,
        resolver_spread_metadata: &RelayResolverSpreadMetadata,
        required: bool,
        imported_resolvers: &mut ImportedResolvers,
    ) {
        let field_name = resolver_spread_metadata.field_name;

        let key = resolver_spread_metadata.field_alias.unwrap_or(field_name);
        let live = resolver_spread_metadata.live;

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

        imported_resolvers
            .0
            .entry(haste_import_name)
            .or_insert(local_resolver_name);

        let mut inner_value = Box::new(AST::ReturnTypeOfFunctionWithName(local_resolver_name));

        if live {
            inner_value = Box::new(AST::ReturnTypeOfMethodCall(inner_value, intern!("read")));
        }

        let value = if required {
            AST::NonNullable(inner_value)
        } else {
            AST::Nullable(inner_value)
        };

        type_selections.push(TypeSelection::ScalarField(TypeSelectionScalarField {
            field_name_or_alias: key,
            special_field: None,
            value,
            conditional: false,
            concrete_type: None,
        }));
    }

    fn visit_inline_fragment(
        &self,
        type_selections: &mut Vec<TypeSelection>,
        inline_fragment: &InlineFragment,
        encountered_enums: &mut EncounteredEnums,
        encountered_fragments: &mut EncounteredFragments,
        imported_resolvers: &mut ImportedResolvers,
        actor_change_status: &mut ActorChangeStatus,
    ) {
        if let Some(module_metadata) = ModuleMetadata::find(&inline_fragment.directives) {
            let name = module_metadata.fragment_name;
            encountered_fragments.0.insert(name);
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
            self.visit_actor_change(
                type_selections,
                inline_fragment,
                encountered_enums,
                encountered_fragments,
                imported_resolvers,
                actor_change_status,
            );
        } else {
            let mut inline_selections = self.visit_selections(
                &inline_fragment.selections,
                encountered_enums,
                encountered_fragments,
                imported_resolvers,
                actor_change_status,
            );

            let mut selections = if let Some(fragment_alias_metadata) =
                FragmentAliasMetadata::find(&inline_fragment.directives)
            {
                // We will model the types as a linked filed containing just the fragment spread.
                vec![TypeSelection::LinkedField(TypeSelectionLinkedField {
                    field_name_or_alias: fragment_alias_metadata.alias.item,
                    // We currently make inline fragment aliases always nullable
                    // because we want to be able to use them to be able to null
                    // them out in the case of missing data.  If we choose to
                    // change that decsion, ane make them non-nullable in the
                    // case where the type condition will always match, we must
                    // be sure to update this logic to account for the
                    // possiblity that a `@required` has bubbled up to this
                    // field.

                    // Additionally, if/when @required is supported _on_ aliased
                    // fragments, we would apply that to this type reference.
                    node_type: TypeReference::Named(fragment_alias_metadata.selection_type),
                    node_selections: selections_to_map(inline_selections.into_iter(), true),
                    conditional: false,
                    concrete_type: None,
                })]
            } else {
                // If the inline fragment is on an abstract type, its selections must be
                // made nullable since the type condition may not match, and
                // there will be no way for the user to refine the type to
                // ensure it did match. However, inline fragments with @alias are
                // not subject to this limitation since RelayReader will make the field null
                // if the type does not match, allowing the user to perfrom a
                // field (alias) null check to ensure the type matched.
                if let Some(type_condition) = inline_fragment.type_condition {
                    for selection in &mut inline_selections {
                        if type_condition.is_abstract_type() {
                            selection.set_conditional(true);
                        } else {
                            selection.set_concrete_type(type_condition);
                        }
                    }
                }

                inline_selections
            };
            type_selections.append(&mut selections);
        }
    }

    fn visit_actor_change(
        &self,
        type_selections: &mut Vec<TypeSelection>,
        inline_fragment: &InlineFragment,
        encountered_enums: &mut EncounteredEnums,
        encountered_fragments: &mut EncounteredFragments,
        imported_resolvers: &mut ImportedResolvers,
        actor_change_status: &mut ActorChangeStatus,
    ) {
        let linked_field = match &inline_fragment.selections[0] {
            Selection::LinkedField(linked_field) => linked_field,
            _ => {
                panic!("Expect to have only linked field in the selection of the actor change")
            }
        };

        *actor_change_status = ActorChangeStatus::HasActorChange;
        let field = self.schema.field(linked_field.definition.item);
        let schema_name = field.name.item;
        let key = if let Some(alias) = linked_field.alias {
            alias.item
        } else {
            schema_name
        };

        let linked_field_selections = self.visit_selections(
            &linked_field.selections,
            encountered_enums,
            encountered_fragments,
            imported_resolvers,
            actor_change_status,
        );
        type_selections.push(TypeSelection::ScalarField(TypeSelectionScalarField {
            field_name_or_alias: key,
            special_field: ScalarFieldSpecialSchemaField::from_schema_name(
                schema_name,
                self.schema_config,
            ),
            value: AST::Nullable(Box::new(AST::ActorChangePoint(Box::new(
                self.selections_to_babel(
                    linked_field_selections.into_iter(),
                    MaskStatus::Masked,
                    None,
                    encountered_enums,
                    encountered_fragments,
                ),
            )))),
            conditional: false,
            concrete_type: None,
        }));
    }

    #[allow(clippy::too_many_arguments)]
    fn raw_response_visit_inline_fragment(
        &self,
        type_selections: &mut Vec<TypeSelection>,
        inline_fragment: &InlineFragment,
        encountered_enums: &mut EncounteredEnums,
        match_fields: &mut MatchFields,
        encountered_fragments: &mut EncounteredFragments,
        imported_raw_response_types: &mut ImportedRawResponseTypes,
        runtime_imports: &mut RuntimeImports,
    ) {
        let mut selections = self.raw_response_visit_selections(
            &inline_fragment.selections,
            encountered_enums,
            match_fields,
            encountered_fragments,
            imported_raw_response_types,
            runtime_imports,
        );
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
            if !match_fields.0.contains_key(&fragment_name) {
                let match_field = self.raw_response_selections_to_babel(
                    selections.iter().filter(|sel| !sel.is_js_field()).cloned(),
                    None,
                    encountered_enums,
                    runtime_imports,
                );
                match_fields.0.insert(fragment_name, match_field);
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
        &self,
        type_selections: &mut Vec<TypeSelection>,
        linked_field: &LinkedField,
        mut visit_selections_fn: impl FnMut(&[Selection]) -> Vec<TypeSelection>,
    ) {
        let field = self.schema.field(linked_field.definition.item);
        let schema_name = field.name.item;
        let key = if let Some(alias) = linked_field.alias {
            alias.item
        } else {
            schema_name
        };
        let selections = visit_selections_fn(&linked_field.selections);

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
        &self,
        type_selections: &mut Vec<TypeSelection>,
        scalar_field: &ScalarField,
        encountered_enums: &mut EncounteredEnums,
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
            special_field: ScalarFieldSpecialSchemaField::from_schema_name(
                schema_name,
                self.schema_config,
            ),
            value: self.transform_scalar_type(&field_type, None, encountered_enums),
            conditional: false,
            concrete_type: None,
        }));
    }

    fn visit_condition(
        &self,
        type_selections: &mut Vec<TypeSelection>,
        condition: &Condition,
        encountered_enums: &mut EncounteredEnums,
        encountered_fragments: &mut EncounteredFragments,
        imported_resolvers: &mut ImportedResolvers,
        actor_change_status: &mut ActorChangeStatus,
    ) {
        let mut selections = self.visit_selections(
            &condition.selections,
            encountered_enums,
            encountered_fragments,
            imported_resolvers,
            actor_change_status,
        );
        for selection in selections.iter_mut() {
            selection.set_conditional(true);
        }
        type_selections.append(&mut selections);
    }

    /// Generates the `...$data` type representing the value read out using the
    /// fragment or operation fragment.
    #[allow(clippy::too_many_arguments)]
    fn get_data_type(
        &self,
        selections: impl Iterator<Item = TypeSelection>,
        mask_status: MaskStatus,
        fragment_type_name: Option<StringKey>,
        emit_optional_type: bool,
        emit_plural_type: bool,
        encountered_enums: &mut EncounteredEnums,
        encountered_fragments: &mut EncounteredFragments,
    ) -> AST {
        let mut data_type = self.selections_to_babel(
            selections,
            mask_status,
            fragment_type_name,
            encountered_enums,
            encountered_fragments,
        );
        if emit_optional_type {
            data_type = AST::Nullable(Box::new(data_type))
        }
        if emit_plural_type {
            data_type = AST::ReadOnlyArray(Box::new(data_type))
        }
        data_type
    }

    fn selections_to_babel(
        &self,
        selections: impl Iterator<Item = TypeSelection>,
        mask_status: MaskStatus,
        fragment_type_name: Option<StringKey>,
        encountered_enums: &mut EncounteredEnums,
        encountered_fragments: &mut EncounteredFragments,
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
                            self.make_prop(
                                selection,
                                mask_status,
                                Some(concrete_type),
                                encountered_enums,
                                encountered_fragments,
                            )
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
                                    mask_status,
                                    Some(type_condition),
                                    encountered_enums,
                                    encountered_fragments,
                                );
                            }
                        }
                    } else if let TypeSelection::LinkedField(ref linked_field) = sel {
                        if let Some(concrete_type) = linked_field.concrete_type {
                            let mut linked_field = linked_field.clone();
                            linked_field.concrete_type = None;
                            return self.make_prop(
                                TypeSelection::LinkedField(linked_field),
                                mask_status,
                                Some(concrete_type),
                                encountered_enums,
                                encountered_fragments,
                            );
                        }
                    }

                    self.make_prop(
                        sel,
                        mask_status,
                        None,
                        encountered_enums,
                        encountered_fragments,
                    )
                })
                .collect();
            types.push(selection_map_values);
        }

        AST::Union(SortedASTList::new(
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
                    if mask_status == MaskStatus::Unmasked {
                        AST::InexactObject(InexactObject::new(props))
                    } else {
                        AST::ExactObject(ExactObject::new(props))
                    }
                })
                .collect(),
        ))
    }

    fn raw_response_selections_to_babel(
        &self,
        selections: impl Iterator<Item = TypeSelection>,
        concrete_type: Option<Type>,
        encountered_enums: &mut EncounteredEnums,
        runtime_imports: &mut RuntimeImports,
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
            return AST::ExactObject(ExactObject::new(Default::default()));
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
                types.push(AST::ExactObject(ExactObject::new(
                    merged_selections
                        .iter()
                        .cloned()
                        .map(|selection| {
                            self.raw_response_make_prop(
                                selection,
                                Some(concrete_type),
                                encountered_enums,
                                runtime_imports,
                            )
                        })
                        .collect(),
                )));
                self.append_local_3d_payload(
                    &mut types,
                    &merged_selections,
                    Some(concrete_type),
                    encountered_enums,
                    runtime_imports,
                );
            }
        }

        if !base_fields.is_empty() {
            types.push(AST::ExactObject(ExactObject::new(
                base_fields
                    .iter()
                    .cloned()
                    .map(|selection| {
                        self.raw_response_make_prop(
                            selection,
                            concrete_type,
                            encountered_enums,
                            runtime_imports,
                        )
                    })
                    .collect(),
            )));
            self.append_local_3d_payload(
                &mut types,
                &base_fields,
                concrete_type,
                encountered_enums,
                runtime_imports,
            );
        }

        AST::Union(SortedASTList::new(types))
    }

    fn append_local_3d_payload(
        &self,
        types: &mut Vec<AST>,
        type_selections: &[TypeSelection],
        concrete_type: Option<Type>,
        encountered_enums: &mut EncounteredEnums,
        runtime_imports: &mut RuntimeImports,
    ) {
        if let Some(module_import) = type_selections.iter().find_map(|sel| {
            if let TypeSelection::ModuleDirective(m) = sel {
                Some(m)
            } else {
                None
            }
        }) {
            runtime_imports.local_3d_payload_type_should_be_imported = true;

            types.push(AST::Local3DPayload(
                module_import.document_name,
                Box::new(AST::ExactObject(ExactObject::new(
                    type_selections
                        .iter()
                        .filter(|sel| !sel.is_js_field())
                        .map(|sel| {
                            self.raw_response_make_prop(
                                sel.clone(),
                                concrete_type,
                                encountered_enums,
                                runtime_imports,
                            )
                        })
                        .collect(),
                ))),
            ));
        }
    }

    fn make_prop(
        &self,
        type_selection: TypeSelection,
        mask_status: MaskStatus,
        concrete_type: Option<Type>,
        encountered_enums: &mut EncounteredEnums,
        encountered_fragments: &mut EncounteredFragments,
    ) -> Prop {
        let optional = type_selection.is_conditional();
        if self.generating_updatable_types && optional {
            panic!(
                "When generating types for updatable operations and fragments, we should never generate optional fields! This indicates a bug in Relay. type_selection: {:?}",
                type_selection
            );
        }

        match type_selection {
            TypeSelection::LinkedField(linked_field) => {
                let key = linked_field.field_name_or_alias;

                if self.generating_updatable_types {
                    // TODO check whether the field is `node` or `nodes` on `Query`. If so, it should not be
                    // updatable.

                    let (just_fragments, no_fragments) =
                        extract_fragments(linked_field.node_selections);

                    let getter_object_props = self.selections_to_babel(
                        no_fragments.into_iter(),
                        mask_status,
                        None,
                        encountered_enums,
                        encountered_fragments,
                    );
                    let getter_return_value = self.transform_scalar_type(
                        &linked_field.node_type,
                        Some(getter_object_props),
                        encountered_enums,
                    );

                    let setter_parameter = if just_fragments.is_empty() {
                        if linked_field.node_type.is_list() {
                            AST::RawType(intern!("[]"))
                        } else {
                            AST::RawType(intern!("null | void"))
                        }
                    } else {
                        let setter_parameter = AST::Union(
                            	SortedASTList::new(
                                just_fragments
                                    .iter()
                                    .map(|fragment_spread| {
                                        let type_condition_info =  fragment_spread
                                            .type_condition_info
                                            .expect("Fragment spreads in updatable queries should have TypeConditionInfo");
                                        let (key, value) = match type_condition_info {
                                            TypeConditionInfo::Abstract => (format!("__is{}", fragment_spread.fragment_name).intern(), AST::String),
                                            TypeConditionInfo::Concrete { concrete_type } => ("__typename".intern(), AST::StringLiteral(StringLiteral(concrete_type))),
                                        };
                                        let fragment_spread_or_concrete_type_marker = Prop::KeyValuePair(KeyValuePairProp {
                                            key,
                                            value,
                                            read_only: true,
                                            optional: false,
                                        });
                                        let assignable_fragment_spread_ref= Prop::KeyValuePair(KeyValuePairProp {
                                            key: *KEY_FRAGMENT_SPREADS,
                                            value: AST::FragmentReferenceType(
                                                fragment_spread.fragment_name,
                                            ),
                                            read_only: true,
                                            optional: false,
                                        });
                                        let client_id_field = Prop::KeyValuePair(KeyValuePairProp {
                                            key: "__id".intern(),
                                            value: AST::String,
                                            read_only: true,
                                            optional: false,
                                        });

                                        AST::InexactObject(InexactObject::new(vec![
                                            assignable_fragment_spread_ref,
                                            fragment_spread_or_concrete_type_marker,
                                            client_id_field,
                                        ]))
                                    })
                                    .collect(),
                            ));
                        if linked_field.node_type.is_list() {
                            AST::ReadOnlyArray(Box::new(setter_parameter))
                        } else {
                            AST::Nullable(Box::new(setter_parameter))
                        }
                    };

                    Prop::GetterSetterPair(GetterSetterPairProp {
                        key,
                        getter_return_value,
                        setter_parameter,
                    })
                } else {
                    let object_props = self.selections_to_babel(
                        hashmap_into_values(linked_field.node_selections),
                        mask_status,
                        None,
                        encountered_enums,
                        encountered_fragments,
                    );
                    let value = self.transform_scalar_type(
                        &linked_field.node_type,
                        Some(object_props),
                        encountered_enums,
                    );

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
                            value: AST::StringLiteral(StringLiteral(
                                self.schema.get_type_name(concrete_type),
                            )),
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
                        // all special fields are read only
                        read_only: !self.generating_updatable_types
                            || scalar_field.special_field.is_some(),
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
        &self,
        type_selection: TypeSelection,
        concrete_type: Option<Type>,
        encountered_enums: &mut EncounteredEnums,
        runtime_imports: &mut RuntimeImports,
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
                    encountered_enums,
                    runtime_imports,
                );
                Prop::KeyValuePair(KeyValuePairProp {
                    key: linked_field.field_name_or_alias,
                    value: self.transform_scalar_type(
                        &node_type,
                        Some(object_props),
                        encountered_enums,
                    ),
                    read_only: true,
                    optional,
                })
            }
            TypeSelection::ScalarField(scalar_field) => {
                if scalar_field.special_field == Some(ScalarFieldSpecialSchemaField::TypeName) {
                    if let Some(concrete_type) = concrete_type {
                        Prop::KeyValuePair(KeyValuePairProp {
                            key: scalar_field.field_name_or_alias,
                            value: AST::StringLiteral(StringLiteral(
                                self.schema.get_type_name(concrete_type),
                            )),
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
        &self,
        type_reference: &TypeReference,
        object_props: Option<AST>,
        encountered_enums: &mut EncounteredEnums,
    ) -> AST {
        match type_reference {
            TypeReference::NonNull(non_null_ref) => self.transform_non_nullable_scalar_type(
                &(*non_null_ref),
                object_props,
                encountered_enums,
            ),
            _ => AST::Nullable(Box::new(self.transform_non_nullable_scalar_type(
                type_reference,
                object_props,
                encountered_enums,
            ))),
        }
    }

    fn transform_non_nullable_scalar_type(
        &self,
        type_reference: &TypeReference,
        object_props: Option<AST>,
        encountered_enums: &mut EncounteredEnums,
    ) -> AST {
        match type_reference {
            TypeReference::List(of_type) => AST::ReadOnlyArray(Box::new(
                self.transform_scalar_type(of_type, object_props, encountered_enums),
            )),
            TypeReference::Named(named_type) => match named_type {
                Type::Object(_) | Type::Union(_) | Type::Interface(_) => object_props.unwrap(),
                Type::Scalar(scalar_id) => self.transform_graphql_scalar_type(*scalar_id),
                Type::Enum(enum_id) => {
                    self.transform_graphql_enum_type(*enum_id, encountered_enums)
                }
                _ => panic!(),
            },
            TypeReference::NonNull(_) => panic!("unexpected NonNull"),
        }
    }

    fn transform_graphql_scalar_type(&self, scalar: ScalarID) -> AST {
        let scalar_name = self.schema.scalar(scalar).name;
        if let Some(&custom_scalar) = self
            .typegen_config
            .custom_scalar_types
            .get(&scalar_name.item)
        {
            AST::RawType(custom_scalar)
        } else if scalar_name.item == *TYPE_ID || scalar_name.item == *TYPE_STRING {
            AST::String
        } else if scalar_name.item == *TYPE_FLOAT || scalar_name.item == *TYPE_INT {
            AST::Number
        } else if scalar_name.item == *TYPE_BOOLEAN {
            AST::Boolean
        } else {
            if self.typegen_config.require_custom_scalar_types {
                panic!(
                    "Expected the JS type for '{}' to be defined, please update 'customScalarTypes' in your compiler config.",
                    scalar_name.item
                );
            }
            AST::Any
        }
    }

    fn transform_graphql_enum_type(
        &self,
        enum_id: EnumID,
        encountered_enums: &mut EncounteredEnums,
    ) -> AST {
        encountered_enums.0.insert(enum_id);
        AST::Identifier(self.schema.enum_(enum_id).name.item)
    }

    fn write_fragment_imports(
        &mut self,
        fragment_name_to_skip: Option<StringKey>,
        encountered_fragments: EncounteredFragments,
    ) -> FmtResult {
        for current_referenced_fragment in encountered_fragments.0.into_iter().sorted() {
            // Do not write the fragment if it is the "top-level" fragment that we are
            // working on.
            let should_write_current_referenced_fragment = fragment_name_to_skip
                .map_or(true, |fragment_name_to_skip| {
                    fragment_name_to_skip != current_referenced_fragment
                });

            if should_write_current_referenced_fragment {
                let fragment_type_name = format!("{}$fragmentType", current_referenced_fragment);
                match self.js_module_format {
                    JsModuleFormat::CommonJS => {
                        if self.has_unified_output {
                            self.writer.write_import_fragment_type(
                                &[&fragment_type_name],
                                &format!("./{}.graphql", current_referenced_fragment),
                            )?;
                        } else {
                            self.writer.write_any_type_definition(&fragment_type_name)?;
                        }
                    }
                    JsModuleFormat::Haste => {
                        self.writer.write_import_fragment_type(
                            &[&fragment_type_name],
                            &format!("{}.graphql", current_referenced_fragment),
                        )?;
                    }
                }
            }
        }
        Ok(())
    }

    fn write_import_actor_change_point(
        &mut self,
        actor_change_status: ActorChangeStatus,
    ) -> FmtResult {
        if matches!(actor_change_status, ActorChangeStatus::HasActorChange) {
            self.writer
                .write_import_type(&[ACTOR_CHANGE_POINT], REACT_RELAY_MULTI_ACTOR)
        } else {
            Ok(())
        }
    }

    fn write_relay_resolver_imports(
        &mut self,
        mut imported_resolvers: ImportedResolvers,
    ) -> FmtResult {
        imported_resolvers.0.sort_keys();
        for (from, name) in imported_resolvers.0 {
            self.writer
                .write_import_module_default(name.lookup(), from.lookup())?
        }
        Ok(())
    }

    fn write_split_raw_response_type_imports(
        &mut self,
        mut imported_raw_response_types: ImportedRawResponseTypes,
    ) -> FmtResult {
        if imported_raw_response_types.0.is_empty() {
            return Ok(());
        }

        imported_raw_response_types.0.sort();
        for imported_raw_response_type in imported_raw_response_types.0 {
            match self.js_module_format {
                JsModuleFormat::CommonJS => {
                    if self.has_unified_output {
                        self.writer.write_import_fragment_type(
                            &[imported_raw_response_type.lookup()],
                            &format!("./{}.graphql", imported_raw_response_type),
                        )?;
                    } else {
                        self.writer
                            .write_any_type_definition(imported_raw_response_type.lookup())?;
                    }
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

    fn write_enum_definitions(&mut self, encountered_enums: EncounteredEnums) -> FmtResult {
        let enum_ids = encountered_enums.into_sorted_vec(self.schema);
        for enum_id in enum_ids {
            let enum_type = self.schema.enum_(enum_id);
            if let Some(enum_module_suffix) = &self.typegen_config.enum_module_suffix {
                self.writer.write_import_type(
                    &[enum_type.name.item.lookup()],
                    &format!("{}{}", enum_type.name.item, enum_module_suffix),
                )?;
            } else {
                let mut members: Vec<AST> = enum_type
                    .values
                    .iter()
                    .map(|enum_value| AST::StringLiteral(StringLiteral(enum_value.value)))
                    .collect();

                if !self.typegen_config.flow_typegen.no_future_proof_enums {
                    members.push(AST::StringLiteral(StringLiteral(*FUTURE_ENUM_VALUE)));
                }

                self.writer.write_export_type(
                    enum_type.name.item.lookup(),
                    &AST::Union(SortedASTList::new(members)),
                )?;
            }
        }
        Ok(())
    }

    fn generate_provided_variables_type(
        &mut self,
        node: &OperationDefinition,
        input_object_types: &mut InputObjectTypes,
        encountered_enums: &mut EncounteredEnums,
    ) -> FmtResult {
        let fields = node
            .variable_definitions
            .iter()
            .filter_map(|def| {
                def.directives
                    .named(ProvidedVariableMetadata::directive_name())?;

                let provider_func = AST::Callable(Box::new(self.transform_input_type(
                    &def.type_,
                    input_object_types,
                    encountered_enums,
                )));
                let provider_module = Prop::KeyValuePair(KeyValuePairProp {
                    key: "get".intern(),
                    read_only: true,
                    optional: false,
                    value: provider_func,
                });
                Some(Prop::KeyValuePair(KeyValuePairProp {
                    key: def.name.item,
                    read_only: true,
                    optional: false,
                    value: AST::ExactObject(ExactObject::new(vec![provider_module])),
                }))
            })
            .collect_vec();
        if !fields.is_empty() {
            self.writer.write_local_type(
                PROVIDED_VARIABLE_TYPE,
                &AST::ExactObject(ExactObject::new(fields)),
            )?;
        }
        Ok(())
    }

    fn get_input_variables_type(
        &self,
        node: &OperationDefinition,
        encountered_enums: &mut EncounteredEnums,
    ) -> (ExactObject, impl Iterator<Item = (StringKey, ExactObject)>) {
        let mut input_object_types = IndexMap::new();
        (
            ExactObject::new(
                node.variable_definitions
                    .iter()
                    .map(|var_def| {
                        Prop::KeyValuePair(KeyValuePairProp {
                            key: var_def.name.item,
                            read_only: false,
                            optional: !var_def.type_.is_non_null(),
                            value: self.transform_input_type(
                                &var_def.type_,
                                &mut input_object_types,
                                encountered_enums,
                            ),
                        })
                    })
                    .collect(),
            ),
            input_object_types
                .into_iter()
                .map(|(key, val)| (key, val.unwrap_resolved_type())),
        )
    }

    fn write_input_object_types(
        &mut self,
        input_object_types: impl Iterator<Item = (StringKey, ExactObject)>,
    ) -> FmtResult {
        for (type_identifier, input_object_type) in input_object_types {
            self.writer
                .write_export_type(type_identifier.lookup(), &input_object_type.into())?;
        }
        Ok(())
    }

    fn transform_input_type(
        &self,
        type_ref: &TypeReference,
        input_object_types: &mut InputObjectTypes,
        encountered_enums: &mut EncounteredEnums,
    ) -> AST {
        match type_ref {
            TypeReference::NonNull(of_type) => self.transform_non_nullable_input_type(
                of_type,
                input_object_types,
                encountered_enums,
            ),
            _ => AST::Nullable(Box::new(self.transform_non_nullable_input_type(
                type_ref,
                input_object_types,
                encountered_enums,
            ))),
        }
    }

    fn transform_non_nullable_input_type(
        &self,
        type_ref: &TypeReference,
        input_object_types: &mut InputObjectTypes,
        encountered_enums: &mut EncounteredEnums,
    ) -> AST {
        match type_ref {
            TypeReference::List(of_type) => AST::ReadOnlyArray(Box::new(
                self.transform_input_type(of_type, input_object_types, encountered_enums),
            )),
            TypeReference::Named(named_type) => match named_type {
                Type::Scalar(scalar) => self.transform_graphql_scalar_type(*scalar),
                Type::Enum(enum_id) => {
                    self.transform_graphql_enum_type(*enum_id, encountered_enums)
                }
                Type::InputObject(input_object_id) => {
                    let input_object = self.schema.input_object(*input_object_id);
                    if !input_object_types.contains_key(&input_object.name.item) {
                        input_object_types
                            .insert(input_object.name.item, GeneratedInputObject::Pending);

                        let props = ExactObject::new(
                            input_object
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
                                        value: self.transform_input_type(
                                            &field.type_,
                                            input_object_types,
                                            encountered_enums,
                                        ),
                                    })
                                })
                                .collect(),
                        );
                        input_object_types.insert(
                            input_object.name.item,
                            GeneratedInputObject::Resolved(props),
                        );
                    }
                    AST::Identifier(input_object.name.item)
                }
                Type::Union(_) | Type::Object(_) | Type::Interface(_) => {
                    panic!("unexpected non-input type")
                }
            },
            TypeReference::NonNull(_) => panic!("Unexpected NonNull"),
        }
    }

    fn raw_response_visit_selections(
        &self,
        selections: &[Selection],
        encountered_enums: &mut EncounteredEnums,
        match_fields: &mut MatchFields,
        encountered_fragments: &mut EncounteredFragments,
        imported_raw_response_types: &mut ImportedRawResponseTypes,
        runtime_imports: &mut RuntimeImports,
    ) -> Vec<TypeSelection> {
        let mut type_selections = Vec::new();
        for selection in selections {
            match selection {
                Selection::FragmentSpread(spread) => {
                    // @relay_client_component generate fragment spreads without
                    // @no_inline if no_inline isn't enabled for the fragment.
                    if spread.directives.named(*NO_INLINE_DIRECTIVE_NAME).is_some() {
                        let spread_type = spread.fragment.item;
                        imported_raw_response_types.0.insert(spread_type);
                        type_selections.push(TypeSelection::RawResponseFragmentSpread(
                            RawResponseFragmentSpread {
                                value: spread_type,
                                conditional: false,
                                concrete_type: None,
                            },
                        ))
                    }
                }
                Selection::InlineFragment(inline_fragment) => self
                    .raw_response_visit_inline_fragment(
                        &mut type_selections,
                        inline_fragment,
                        encountered_enums,
                        match_fields,
                        encountered_fragments,
                        imported_raw_response_types,
                        runtime_imports,
                    ),
                Selection::LinkedField(linked_field) => {
                    self.gen_visit_linked_field(&mut type_selections, linked_field, |selections| {
                        self.raw_response_visit_selections(
                            selections,
                            encountered_enums,
                            match_fields,
                            encountered_fragments,
                            imported_raw_response_types,
                            runtime_imports,
                        )
                    })
                }
                Selection::ScalarField(scalar_field) => {
                    self.visit_scalar_field(&mut type_selections, scalar_field, encountered_enums)
                }
                Selection::Condition(condition) => {
                    type_selections.extend(self.raw_response_visit_selections(
                        &condition.selections,
                        encountered_enums,
                        match_fields,
                        encountered_fragments,
                        imported_raw_response_types,
                        runtime_imports,
                    ));
                }
            }
        }
        type_selections
    }

    /// Write the assignable fragment validator function.
    ///
    /// Validators accept an item which *may* be valid for assignment and returns either
    /// a sentinel value or something which is necessarily valid for assignment.
    ///
    /// The types of the validator:
    ///
    /// - For fragments whose type condition is abstract:
    /// ({ __id: string, __isFragmentName: ?string, $fragmentSpreads: FragmentRefType }) =>
    ///   ({ __id: string, __isFragmentName: string, $fragmentSpreads: FragmentRefType })
    ///   | false
    ///
    /// - For fragments whose type condition is concrete:
    /// ({ __id: string, __typename: string, $fragmentSpreads: FragmentRefType }) =>
    ///   ({ __id: string, __typename: FragmentType, $fragmentSpreads: FragmentRefType })
    ///   | false
    ///
    /// Validators' runtime behavior checks for the presence of the __isFragmentName marker
    /// (for abstract fragment types) or a matching concrete type (for concrete fragment
    /// types), and returns false iff the parameter didn't pass.
    /// Validators return the parameter (unmodified) if it did pass validation, but with
    /// a changed flowtype.
    fn write_validator_function(
        &mut self,
        fragment_definition: &FragmentDefinition,
        schema: &SDLSchema,
    ) -> FmtResult {
        if fragment_definition.type_condition.is_abstract_type() {
            self.write_abstract_validator_function(fragment_definition)
        } else {
            self.write_concrete_validator_function(fragment_definition, schema)
        }
    }

    /// Write an abstract validator function. Flow example:
    /// function validate(value/*: {
    ///   +__id: string,
    ///   +$fragmentSpreads: Assignable_node$fragmentType,
    ///   +__isAssignable_node: ?string,
    ///   ...
    /// }*/)/*: ({
    ///   +__id: string,
    ///   +$fragmentSpreads: Assignable_node$fragmentType,
    ///   +__isAssignable_node: string,
    ///   ...
    /// } | false)*/ {
    ///   return value.__isAssignable_node != null ? (value/*: any*/) : null
    /// };
    fn write_abstract_validator_function(
        &mut self,
        fragment_definition: &FragmentDefinition,
    ) -> FmtResult {
        let fragment_name = fragment_definition.name.item.lookup();
        let abstract_fragment_spread_marker = format!("__is{}", fragment_name).intern();
        let id_prop = Prop::KeyValuePair(KeyValuePairProp {
            key: *KEY_CLIENTID,
            value: AST::String,
            read_only: true,
            optional: false,
        });
        let fragment_spread_prop = Prop::KeyValuePair(KeyValuePairProp {
            key: *KEY_FRAGMENT_SPREADS,
            value: AST::Identifier(format!("{}{}", fragment_name, *KEY_FRAGMENT_TYPE).intern()),
            read_only: true,
            optional: false,
        });
        let parameter_discriminator = Prop::KeyValuePair(KeyValuePairProp {
            key: abstract_fragment_spread_marker,
            value: AST::String,
            read_only: true,
            optional: true,
        });
        let return_value_discriminator = Prop::KeyValuePair(KeyValuePairProp {
            key: abstract_fragment_spread_marker,
            value: AST::String,
            read_only: true,
            optional: false,
        });

        let parameter_type = AST::InexactObject(InexactObject::new(vec![
            id_prop.clone(),
            fragment_spread_prop.clone(),
            parameter_discriminator,
        ]));
        let return_type = AST::Union(SortedASTList::new(vec![
            AST::InexactObject(InexactObject::new(vec![
                id_prop,
                fragment_spread_prop,
                return_value_discriminator,
            ])),
            AST::RawType(intern!("false")),
        ]));

        let (open_comment, close_comment) = match self.typegen_config.language {
            TypegenLanguage::Flow | TypegenLanguage::JavaScript => ("/*", "*/"),
            TypegenLanguage::TypeScript => ("", ""),
        };

        write!(
            self.writer,
            "function {}(value{}: ",
            VALIDATOR_EXPORT_NAME, &open_comment
        )?;

        self.writer.write(&parameter_type)?;
        write!(self.writer, "{}){}: ", &close_comment, &open_comment)?;
        self.writer.write(&return_type)?;
        write!(
            self.writer,
            "{} {{\n  return value.{} != null ? (value{}: ",
            &close_comment,
            abstract_fragment_spread_marker.lookup(),
            open_comment
        )?;
        self.writer.write(&AST::Any)?;
        write!(self.writer, "{}) : false;\n}}", &close_comment)?;

        Ok(())
    }

    /// Write a concrete validator function. Flow example:
    /// function validate(value/*: {
    ///   +__id: string,
    ///   +$fragmentSpreads: Assignable_user$fragmentType,
    ///   +__typename: ?string,
    ///   ...
    /// }*/)/*: ({
    ///   +__id: string,
    ///   +$fragmentSpreads: Assignable_user$fragmentType,
    ///   +__typename: 'User',
    ///   ...
    /// } | false)*/ {
    ///   return value.__typename === 'User' ? (value/*: any*/) : null
    /// };
    fn write_concrete_validator_function(
        &mut self,
        fragment_definition: &FragmentDefinition,
        schema: &SDLSchema,
    ) -> FmtResult {
        let fragment_name = fragment_definition.name.item.lookup();
        let concrete_typename = schema.get_type_name(fragment_definition.type_condition);
        let id_prop = Prop::KeyValuePair(KeyValuePairProp {
            key: *KEY_CLIENTID,
            value: AST::String,
            read_only: true,
            optional: false,
        });
        let fragment_spread_prop = Prop::KeyValuePair(KeyValuePairProp {
            key: *KEY_FRAGMENT_SPREADS,
            value: AST::Identifier(format!("{}{}", fragment_name, *KEY_FRAGMENT_TYPE).intern()),
            read_only: true,
            optional: false,
        });
        let parameter_discriminator = Prop::KeyValuePair(KeyValuePairProp {
            key: *KEY_TYPENAME,
            value: AST::String,
            read_only: true,
            optional: false,
        });
        let return_value_discriminator = Prop::KeyValuePair(KeyValuePairProp {
            key: *KEY_TYPENAME,
            value: AST::StringLiteral(StringLiteral(concrete_typename)),
            read_only: true,
            optional: false,
        });

        let parameter_type = AST::InexactObject(InexactObject::new(vec![
            id_prop.clone(),
            fragment_spread_prop.clone(),
            parameter_discriminator,
        ]));
        let return_type = AST::Union(SortedASTList::new(vec![
            AST::InexactObject(InexactObject::new(vec![
                id_prop,
                fragment_spread_prop,
                return_value_discriminator,
            ])),
            AST::RawType(intern!("false")),
        ]));

        let (open_comment, close_comment) = match self.typegen_config.language {
            TypegenLanguage::Flow | TypegenLanguage::JavaScript => ("/*", "*/"),
            TypegenLanguage::TypeScript => ("", ""),
        };

        write!(
            self.writer,
            "function {}(value{}: ",
            VALIDATOR_EXPORT_NAME, &open_comment
        )?;
        self.writer.write(&parameter_type)?;
        write!(self.writer, "{}){}: ", &close_comment, &open_comment)?;
        self.writer.write(&return_type)?;
        write!(
            self.writer,
            "{} {{\n  return value.{} === '{}' ? (value{}: ",
            &close_comment,
            KEY_TYPENAME.lookup(),
            concrete_typename.lookup(),
            open_comment
        )?;
        self.writer.write(&AST::Any)?;
        write!(self.writer, "{}) : false;\n}}", &close_comment)?;

        Ok(())
    }
}

fn get_type_condition_info(fragment_spread: &FragmentSpread) -> Option<TypeConditionInfo> {
    fragment_spread
        .directives
        .named(*ASSIGNABLE_DIRECTIVE_FOR_TYPEGEN)
        .map(|directive| {
            directive
                .data
                .as_ref()
                .and_then(|data| data.downcast_ref().copied())
                .expect("If a fragment spread contains an __updatable directive, the associated data should be present and have type TypeConditionInfo")
        })
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
    let mut regular_fragment_spreads = None;
    let mut updatable_fragment_spreads = None;
    let mut props = props.into_iter();
    std::iter::from_fn(move || {
        while let Some(prop) = props.next() {
            if let TypeSelection::FragmentSpread(inline_fragment) = prop {
                if inline_fragment.is_updatable_fragment_spread {
                    updatable_fragment_spreads
                        .get_or_insert_with(Vec::new)
                        .push(inline_fragment.fragment_name);
                } else {
                    regular_fragment_spreads
                        .get_or_insert_with(Vec::new)
                        .push(inline_fragment.fragment_name);
                }
            } else if let TypeSelection::InlineFragment(inline_fragment) = prop {
                regular_fragment_spreads
                    .get_or_insert_with(Vec::new)
                    .push(inline_fragment.fragment_name);
            } else {
                return Some(prop);
            }
        }
        if let Some(refs) = regular_fragment_spreads.take() {
            return Some(TypeSelection::ScalarField(TypeSelectionScalarField {
                field_name_or_alias: *KEY_FRAGMENT_SPREADS,
                value: AST::FragmentReference(SortedStringKeyList::new(refs)),
                special_field: None,
                conditional: false,
                concrete_type: None,
            }));
        }
        if let Some(refs) = updatable_fragment_spreads.take() {
            return Some(TypeSelection::ScalarField(TypeSelectionScalarField {
                field_name_or_alias: *KEY_UPDATABLE_FRAGMENT_SPREADS,
                value: AST::FragmentReference(SortedStringKeyList::new(refs)),
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
