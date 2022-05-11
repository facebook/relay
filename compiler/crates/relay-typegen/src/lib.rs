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
mod writer;

use ::intern::{
    intern,
    string_key::{Intern, StringKey},
};
use common::NamedItem;
use flow::FlowPrinter;
use graphql_ir::{FragmentDefinition, OperationDefinition, ProvidedVariableMetadata, Selection};
use indexmap::IndexMap;
use itertools::Itertools;
use javascript::JavaScriptPrinter;
use lazy_static::lazy_static;
use relay_config::{JsModuleFormat, ProjectConfig, SchemaConfig};
pub use relay_config::{TypegenConfig, TypegenLanguage};
use relay_transforms::{
    RefetchableDerivedFromMetadata, RefetchableMetadata, RelayDirective, TypeConditionInfo,
    ASSIGNABLE_DIRECTIVE, CHILDREN_CAN_BUBBLE_METADATA_KEY, UPDATABLE_DIRECTIVE,
};
use schema::{SDLSchema, Schema, Type, TypeReference};
use std::fmt::Result as FmtResult;
use typegen_state::*;
use typescript::TypeScriptPrinter;
use visit::{
    get_data_type, get_input_variables_type, raw_response_selections_to_babel,
    raw_response_visit_selections, transform_input_type, visit_selections,
};
use writer::{
    ExactObject, InexactObject, KeyValuePairProp, Prop, SortedASTList, SortedStringKeyList,
    StringLiteral, Writer, AST,
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
        let type_selections = visit_selections(
            self,
            &typegen_operation.selections,
            &mut encountered_enums,
            &mut encountered_fragments,
            &mut imported_resolvers,
            &mut actor_change_status,
        );
        let mut imported_raw_response_types = Default::default();
        let data_type = get_data_type(
            self,
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
                let raw_response_selections = raw_response_visit_selections(
                    self,
                    &normalization_operation.selections,
                    &mut encountered_enums,
                    &mut match_fields,
                    &mut encountered_fragments,
                    &mut imported_raw_response_types,
                    &mut runtime_imports,
                );
                Some((
                    raw_response_selections_to_babel(
                        self,
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
            get_input_variables_type(self, typegen_operation, &mut encountered_enums);

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

        let raw_response_selections = raw_response_visit_selections(
            self,
            &normalization_operation.selections,
            &mut encountered_enums,
            &mut match_fields,
            &mut encountered_fragments,
            &mut imported_raw_response_types,
            &mut runtime_imports,
        );
        let raw_response_type = raw_response_selections_to_babel(
            self,
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
        let mut type_selections = visit_selections(
            self,
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

        let data_type = get_data_type(
            self,
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

                let provider_func = AST::Callable(Box::new(transform_input_type(
                    self,
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

fn is_plural(node: &FragmentDefinition) -> bool {
    RelayDirective::find(&node.directives).map_or(false, |relay_directive| relay_directive.plural)
}
