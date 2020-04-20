/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![allow(warnings)]
#[allow(unused_imports)]
use crate::ast::{Ast, AstBuilder, AstKey, Primitive};
use crate::codegen_ast::*;
use crate::constants::CODEGEN_CONSTANTS;
use common::WithLocation;
use graphql_ir::{
    Argument, Condition, ConditionValue, ConstantValue, Directive, FragmentDefinition,
    FragmentSpread, InlineFragment, LinkedField, NamedItem, OperationDefinition, ScalarField,
    Selection, Value, VariableDefinition,
};
use graphql_syntax::OperationKind;
use graphql_transforms::{
    extract_connection_metadata_from_directive, extract_handle_field_directives,
    extract_relay_directive, extract_values_from_handle_field_directive, extract_variable_name,
    remove_directive, ConnectionConstants, HandleFieldConstants, DEFER_STREAM_CONSTANTS,
    MATCH_CONSTANTS, RELAY_DIRECTIVE_CONSTANTS,
};
use interner::{Intern, StringKey};
use schema::{Schema, TypeReference};
use serde_json::{json, Map as SerdeMap, Value as SerdeValue};
use std::iter;

/* TODO
pub fn build_request(
    schema: &Schema,
    operation: &OperationDefinition,
    fragment: &FragmentDefinition,
    request_parameters: RequestParameters,
) -> ConcreteRequest {
    ConcreteRequest {
        kind: "Request",
        fragment: build_fragment(schema, fragment),
        operation: build_operation(schema, operation),
        params: request_parameters,
    }
}
*/

pub fn build_request_params(operation: &OperationDefinition) -> RequestParameters {
    RequestParameters {
        name: operation.name.item,
        operation_kind: match operation.kind {
            OperationKind::Query => ConcreteOperationKind::Query,
            OperationKind::Mutation => ConcreteOperationKind::Mutation,
            OperationKind::Subscription => ConcreteOperationKind::Subscription,
        },
        metadata: Default::default(),
        id: None,
        text: None,
    }
}

pub fn build_operation(
    schema: &Schema,
    ast_builder: &mut AstBuilder,
    operation: &OperationDefinition,
) -> AstKey {
    let mut builder = CodegenBuilder::new(schema, CodegenVariant::Normalization, ast_builder);
    builder.build_operation(operation)
}

pub fn build_fragment(
    schema: &Schema,
    ast_builder: &mut AstBuilder,
    fragment: &FragmentDefinition,
) -> ConcreteDefinition {
    let builder = CodegenBuilder::new(schema, CodegenVariant::Reader, ast_builder);
    builder.build_fragment(fragment)
}

struct CodegenBuilder<'schema, 'builder> {
    connection_constants: ConnectionConstants,
    handle_field_constants: HandleFieldConstants,
    schema: &'schema Schema,
    variant: CodegenVariant,
    ast_builder: &'builder mut AstBuilder,
}

#[derive(PartialEq)]
enum CodegenVariant {
    Reader,
    Normalization,
}

impl<'schema, 'builder> CodegenBuilder<'schema, 'builder> {
    fn new(
        schema: &'schema Schema,
        variant: CodegenVariant,
        ast_builder: &'builder mut AstBuilder,
    ) -> Self {
        Self {
            connection_constants: Default::default(),
            handle_field_constants: Default::default(),
            schema,
            variant,
            ast_builder,
        }
    }

    pub fn object(&mut self, object: Vec<(StringKey, Primitive)>) -> AstKey {
        self.ast_builder.intern(Ast::Object(object))
    }

    pub fn array(&mut self, array: Vec<Primitive>) -> AstKey {
        self.ast_builder.intern(Ast::Array(array))
    }

    fn build_operation(&mut self, operation: &OperationDefinition) -> AstKey {
        match operation
            .directives
            .named(MATCH_CONSTANTS.custom_module_directive_name)
        {
            Some(split_directive) => {
                let derived_from = split_directive
                    .arguments
                    .named(MATCH_CONSTANTS.derived_from_arg)
                    .unwrap()
                    .value
                    .item
                    .get_string_literal()
                    .unwrap();
                let metadata = Primitive::Key(self.object(vec![(
                    CODEGEN_CONSTANTS.derived_from,
                    Primitive::String(derived_from),
                )]));
                self.object(vec![
                    (
                        CODEGEN_CONSTANTS.kind,
                        Primitive::String(CODEGEN_CONSTANTS.split_operation),
                    ),
                    (
                        CODEGEN_CONSTANTS.name,
                        Primitive::String(operation.name.item),
                    ),
                    (
                        CODEGEN_CONSTANTS.selections,
                        Primitive::Null,
                        // TODO: self.build_selections(&operation.selections),
                    ),
                    (CODEGEN_CONSTANTS.metadata, metadata),
                ])
            }
            None => {
                let argument_definitions =
                    self.build_operation_variable_definitions(&operation.variable_definitions);
                self.object(vec![
                    (CODEGEN_CONSTANTS.argument_definitions, argument_definitions),
                    (
                        CODEGEN_CONSTANTS.kind,
                        Primitive::String("Operation".intern()),
                    ),
                    (
                        CODEGEN_CONSTANTS.name,
                        Primitive::String(operation.name.item),
                    ),
                    (
                        CODEGEN_CONSTANTS.selections,
                        Primitive::Null, // TODO: self.build_selections(&operation.selections),
                    ),
                ])
            }
        }
    }

    fn build_fragment(&self, fragment: &FragmentDefinition) -> ConcreteDefinition {
        let connection_metadata = if let Some(metadata_values) =
            extract_connection_metadata_from_directive(
                &fragment.directives,
                self.connection_constants,
            ) {
            Some(
                metadata_values
                    .iter()
                    .map(|metadata| ConnectionMetadata {
                        path: metadata.path.clone(),
                        direction: Some(metadata.direction),
                        cursor: metadata.cursor,
                        count: metadata.count,
                        stream: if metadata.is_stream_connection {
                            Some(metadata.is_stream_connection)
                        } else {
                            None
                        },
                    })
                    .collect::<Vec<_>>(),
            )
        } else {
            None
        };

        let mut plural = None;
        let mut mask = None;
        if let Some(directive) = extract_relay_directive(&fragment.directives) {
            for arg in &directive.arguments {
                if arg.name.item == RELAY_DIRECTIVE_CONSTANTS.plural_arg_name {
                    if let Value::Constant(ConstantValue::Boolean(value)) = arg.value.item {
                        plural = Some(value);
                    }
                } else if arg.name.item == RELAY_DIRECTIVE_CONSTANTS.mask_arg_name {
                    if let Value::Constant(ConstantValue::Boolean(value)) = arg.value.item {
                        mask = Some(value);
                    }
                }
            }
        }

        let refetch = None;

        let metadata = if connection_metadata.is_some()
            || mask.is_some()
            || plural.is_some()
            || refetch.is_some()
        {
            Some(FragmentMetadata {
                connection: connection_metadata,
                mask,
                plural,
                refetch,
            })
        } else {
            None
        };

        ConcreteDefinition::Fragment(ConcreteFragment {
            name: fragment.name.item,
            type_: self.schema.get_type_name(fragment.type_condition),
            argument_definitions: self.build_fragment_variable_definitions(
                &fragment.variable_definitions,
                &fragment.used_global_variables,
            ),
            selections: self.build_selections(&fragment.selections),
            // TODO(T63303840) include correct fragment metadata
            metadata,
        })
    }

    fn build_selections(&self, selections: &[Selection]) -> Vec<ConcreteSelection> {
        selections
            .iter()
            .flat_map(|selection| self.build_selections_from_selection(selection))
            .collect()
    }

    fn build_selections_from_selection(&self, selection: &Selection) -> Vec<ConcreteSelection> {
        match selection {
            // TODO(T63303873) Normalization handles
            Selection::Condition(cond) => {
                vec![ConcreteSelection::Condition(self.build_condition(&cond))]
            }
            Selection::FragmentSpread(frag_spread) => {
                let defer = frag_spread
                    .directives
                    .named(DEFER_STREAM_CONSTANTS.defer_name);
                match defer {
                    Some(defer) => vec![self.build_defer(&frag_spread, defer)],
                    None => vec![ConcreteSelection::FragmentSpread(
                        self.build_fragment_spread(&frag_spread),
                    )],
                }
            }
            Selection::InlineFragment(inline_frag) => {
                vec![self.build_inline_fragment(&inline_frag)]
            }
            Selection::LinkedField(field) => {
                let stream = field.directives.named(DEFER_STREAM_CONSTANTS.stream_name);

                match stream {
                    Some(stream) => vec![self.build_stream(&field, stream)],
                    None => self.build_linked_field_and_handles(field),
                }
            }
            Selection::ScalarField(field) => self.build_scalar_field_and_handles(field),
        }
    }

    fn build_scalar_field_and_handles(&self, field: &ScalarField) -> Vec<ConcreteSelection> {
        // TODO(T63303873) check for skipNormalizationNode metadata
        match self.variant {
            CodegenVariant::Reader => vec![self.build_scalar_field(field)],
            CodegenVariant::Normalization => iter::once(self.build_scalar_field(field))
                .chain(self.build_scalar_handles(field))
                .collect(),
        }
    }

    fn build_scalar_field(&self, field: &ScalarField) -> ConcreteSelection {
        let schema_field = self.schema.field(field.definition.item);
        let (name, alias) =
            self.build_field_name_and_alias(schema_field.name, field.alias, &field.directives);
        let args = self.build_arguments(&field.arguments);
        let storage_key = get_static_storage_key(name, &args);
        ConcreteSelection::ScalarField(ConcreteScalarField {
            alias,
            name,
            args,
            storage_key,
        })
    }

    fn build_scalar_handles(
        &self,
        field: &'schema ScalarField,
    ) -> impl IntoIterator<Item = ConcreteSelection> + '_ {
        let schema_field = self.schema.field(field.definition.item);
        let field_name = schema_field.name;
        let handle_field_directives =
            extract_handle_field_directives(&field.directives, self.handle_field_constants);

        handle_field_directives.map(move |directive| {
            let values = extract_values_from_handle_field_directive(
                &directive,
                self.handle_field_constants,
                None,
                None,
            );

            ConcreteSelection::ScalarHandle(ConcreteNormalizationScalarHandle {
                alias: match field.alias {
                    Some(alias) => Some(alias.item),
                    None => None,
                },
                name: field_name,
                args: self.build_arguments(&field.arguments),
                handle: values.handle,
                key: values.key,
                filters: values.filters,
            })
        })
    }

    fn build_linked_field_and_handles(&self, field: &LinkedField) -> Vec<ConcreteSelection> {
        match self.variant {
            CodegenVariant::Reader => vec![self.build_linked_field(field)],
            CodegenVariant::Normalization => iter::once(self.build_linked_field(field))
                .chain(self.build_linked_handles(field))
                .collect(),
        }
    }

    fn build_linked_field(&self, field: &LinkedField) -> ConcreteSelection {
        let schema_field = self.schema.field(field.definition.item);
        let (name, alias) =
            self.build_field_name_and_alias(schema_field.name, field.alias, &field.directives);
        let args = self.build_arguments(&field.arguments);
        let storage_key = get_static_storage_key(name, &args);
        ConcreteSelection::LinkedField(ConcreteLinkedField {
            alias,
            name,
            args,
            selections: self.build_selections(&field.selections),
            concrete_type: if self.schema.is_abstract_type(schema_field.type_.inner()) {
                None
            } else {
                Some(self.schema.get_type_name(schema_field.type_.inner()))
            },
            storage_key,
            plural: schema_field.type_.is_list(),
        })
    }

    fn build_linked_handles(
        &self,
        field: &'schema LinkedField,
    ) -> impl IntoIterator<Item = ConcreteSelection> + '_ {
        let schema_field = self.schema.field(field.definition.item);
        let field_name = schema_field.name;
        let handle_field_directives =
            extract_handle_field_directives(&field.directives, self.handle_field_constants);

        handle_field_directives.map(move |directive| {
            let values = extract_values_from_handle_field_directive(
                &directive,
                self.handle_field_constants,
                None,
                None,
            );

            ConcreteSelection::LinkedHandle(ConcreteNormalizationLinkedHandle {
                alias: match field.alias {
                    Some(alias) => Some(alias.item),
                    None => None,
                },
                name: field_name,
                args: self.build_arguments(&field.arguments),
                handle: values.handle,
                key: values.key,
                filters: values.filters,
                dynamic_key: match &values.dynamic_key {
                    Some(val) => self.build_argument("__dynamicKey".intern(), val),
                    None => None,
                },
            })
        })
    }

    fn build_field_name_and_alias(
        &self,
        mut name: StringKey,
        alias: Option<WithLocation<StringKey>>,
        directives: &[Directive],
    ) -> (StringKey, Option<StringKey>) {
        let mut alias = alias.map(|alias| alias.item);
        if self.variant == CodegenVariant::Reader {
            let mut handle_field_directives =
                extract_handle_field_directives(directives, self.handle_field_constants);
            if let Some(handle_field_directive) = handle_field_directives.next() {
                if let Some(other_handle_field_directive) = handle_field_directives.next() {
                    panic!(
                        "Expected at most one handle directive, got `{:?}` and `{:?}`.",
                        handle_field_directive, other_handle_field_directive
                    );
                }
                let values = extract_values_from_handle_field_directive(
                    &handle_field_directive,
                    self.handle_field_constants,
                    None,
                    None,
                );
                alias = alias.or_else(|| Some(name));
                name = format!("__{}_{}", values.key, values.handle).intern();
            }
        }
        (name, alias)
    }

    fn build_fragment_spread(&self, frag_spread: &FragmentSpread) -> ConcreteFragmentSpread {
        ConcreteFragmentSpread {
            name: frag_spread.fragment.item,
            args: self.build_arguments(&frag_spread.arguments),
        }
    }

    fn build_defer(&self, frag_spread: &FragmentSpread, defer: &Directive) -> ConcreteSelection {
        let next_selections = vec![ConcreteSelection::FragmentSpread(
            self.build_fragment_spread(&FragmentSpread {
                directives: remove_directive(
                    &frag_spread.directives,
                    DEFER_STREAM_CONSTANTS.defer_name,
                ),
                ..frag_spread.to_owned()
            }),
        )];
        match self.variant {
            CodegenVariant::Reader => ConcreteSelection::DeferReaderVariant(DeferReaderNode {
                selections: next_selections,
            }),
            CodegenVariant::Normalization => {
                let if_arg = defer.arguments.named(DEFER_STREAM_CONSTANTS.if_arg);
                let label_arg = defer.arguments.named(DEFER_STREAM_CONSTANTS.label_arg);
                let if_variable_name = extract_variable_name(if_arg);
                let label_name = match label_arg {
                    Some(label_arg) => match &label_arg.value.item {
                        Value::Constant(ConstantValue::String(val)) => Some(val),
                        _ => None,
                    },
                    None => None,
                }
                .unwrap();
                ConcreteSelection::DeferNormalizationVariant(DeferNormalizationNode {
                    if_: if_variable_name,
                    metadata: None,
                    label: label_name.to_owned(),
                    selections: next_selections,
                })
            }
        }
    }

    fn build_stream(&self, linked_field: &LinkedField, stream: &Directive) -> ConcreteSelection {
        let next_selections = vec![self.build_linked_field(&LinkedField {
            directives: remove_directive(
                &linked_field.directives,
                DEFER_STREAM_CONSTANTS.stream_name,
            ),
            ..linked_field.to_owned()
        })];
        match self.variant {
            CodegenVariant::Reader => ConcreteSelection::StreamReaderVariant(StreamReaderNode {
                selections: next_selections,
            }),
            CodegenVariant::Normalization => {
                let if_arg = stream.arguments.named(DEFER_STREAM_CONSTANTS.if_arg);
                let label_arg = stream.arguments.named(DEFER_STREAM_CONSTANTS.label_arg);
                let use_customized_batch_arg = stream
                    .arguments
                    .named(DEFER_STREAM_CONSTANTS.use_customized_batch_arg);
                let if_variable_name = extract_variable_name(if_arg);
                let use_customized_batch_variable_name =
                    extract_variable_name(use_customized_batch_arg);
                let label_name = match label_arg {
                    Some(label_arg) => match &label_arg.value.item {
                        Value::Constant(ConstantValue::String(val)) => Some(val),
                        _ => None,
                    },
                    None => None,
                }
                .unwrap();

                ConcreteSelection::StreamNormalizationVariant(StreamNormalizationNode {
                    if_: if_variable_name,
                    metadata: None,
                    use_customized_batch: use_customized_batch_variable_name,
                    label: label_name.to_owned(),
                    selections: next_selections,
                })
            }
        }
    }

    fn build_inline_fragment(&self, inline_frag: &InlineFragment) -> ConcreteSelection {
        match inline_frag.type_condition {
            None => {
                // TODO(T63388023): Use typed custom directives
                if inline_frag.directives.len() == 1
                    && inline_frag.directives[0].name.item == "__clientExtension".intern()
                {
                    ConcreteSelection::ClientExtension(ConcreteClientExtension {
                        selections: self.build_selections(&inline_frag.selections),
                    })
                } else {
                    // TODO(T63559346): Handle anonymous inline fragments with no directives
                    panic!(
                        "Unexpected custom directives: {:#?}",
                        inline_frag.directives
                    );
                }
            }
            Some(type_condition) => {
                if inline_frag
                    .directives
                    .named(MATCH_CONSTANTS.custom_module_directive_name)
                    .is_some()
                {
                    ConcreteSelection::InlineFragment(ConcreteInlineFragment {
                        type_: self.schema.get_type_name(type_condition),
                        selections: vec![build_module_import_selection(&inline_frag.directives[0])],
                    })
                } else {
                    ConcreteSelection::InlineFragment(ConcreteInlineFragment {
                        type_: self.schema.get_type_name(type_condition),
                        selections: self.build_selections(&inline_frag.selections),
                    })
                }
            }
        }
    }

    fn build_condition(&self, condition: &Condition) -> ConcreteCondition {
        ConcreteCondition {
            passing_value: condition.passing_value,
            condition: match &condition.value {
                ConditionValue::Variable(variable) => variable.name.item,
                ConditionValue::Constant(_) => {
                    panic!("Expected Condition with static value to have been pruned or inlined.")
                }
            },
            selections: self.build_selections(&condition.selections),
        }
    }

    fn build_variable_type(&self, type_: &TypeReference) -> StringKey {
        match type_ {
            TypeReference::Named(inner) => self.schema.get_type_name(inner.clone()),
            _ => self.schema.get_type_string(type_).intern(),
        }
    }

    fn build_operation_variable_definitions(
        &mut self,
        variable_definitions: &[VariableDefinition],
    ) -> Primitive {
        let mut var_defs = variable_definitions
            .iter()
            .map(|def| {
                let default_value = if let Some(const_val) = &def.default_value {
                    self.build_constant_value(&const_val)
                } else {
                    Primitive::Null
                };
                (
                    def.name.item,
                    Primitive::Key(self.object(vec![
                        (CODEGEN_CONSTANTS.default_value, default_value),
                        (
                            CODEGEN_CONSTANTS.kind,
                            Primitive::String("LocalArgument".intern()),
                        ),
                        (CODEGEN_CONSTANTS.name, Primitive::String(def.name.item)),
                        (
                            CODEGEN_CONSTANTS.type_,
                            Primitive::String(self.build_variable_type(&def.type_)),
                        ),
                    ])),
                )
            })
            .collect::<Vec<_>>();

        var_defs.sort_by_key(|var_def| var_def.0.lookup());
        Primitive::Key(self.array(var_defs.into_iter().map(|v| v.1).collect::<Vec<_>>()))
    }

    fn build_fragment_variable_definitions(
        &self,
        local_variable_definitions: &[VariableDefinition],
        global_variable_definitions: &[VariableDefinition],
    ) -> Vec<ConcreteVariableDefinition> {
        // TODO(T63164787) this will produce argument_definitions in a different order than our JS codegen
        let local_vars_iter = local_variable_definitions.iter().map(|def| {
            ConcreteVariableDefinition::LocalArgument(ConcreteLocalVariableDefinition {
                name: def.name.item,
                type_: self.build_variable_type(&def.type_),
                default_value: if let Some(_const_val) = &def.default_value {
                    json!(null) // TODO: self.build_constant_value(&const_val)
                } else {
                    json!(null)
                },
            })
        });
        let global_vars_iter = global_variable_definitions.iter().map(|def| {
            ConcreteVariableDefinition::RootArgument(ConcreteGlobalVariableDefinition {
                name: def.name.item,
                type_: self.build_variable_type(&def.type_),
            })
        });
        local_vars_iter.chain(global_vars_iter).collect::<Vec<_>>()
        // TODO: var_defs.sort_by_key(|var_def| var_def.name().lookup());
    }

    fn build_arguments(&self, arguments: &[Argument]) -> Option<Vec<ConcreteArgument>> {
        let mut args = arguments
             .iter()
             // We are filtering out "null" arguments matching JS behavior
             .filter_map(|arg| self.build_argument(arg.name.item, &arg.value.item))
             .collect::<Vec<_>>();
        args.sort_by_key(|arg| arg.name().lookup());
        match args.len() {
            0 => None,
            _ => Some(args),
        }
    }

    fn build_argument(&self, arg_name: StringKey, arg_value: &Value) -> Option<ConcreteArgument> {
        match arg_value {
            Value::Constant(const_val) => {
                if let Some(concrete_const_val) = self.build_constant_argument(arg_name, &const_val)
                {
                    Some(ConcreteArgument::Literal(concrete_const_val))
                } else {
                    None
                }
            }
            Value::Variable(variable) => {
                Some(ConcreteArgument::Variable(ConcreteVariableArgument {
                    name: arg_name,
                    // TODO(T63303966) this is always skipped in JS compiler
                    type_: None,
                    variable_name: variable.name.item,
                }))
            }
            Value::List(list) => Some(ConcreteArgument::ListValue(ConcreteListArgument {
                name: arg_name,
                items: list
                    .iter()
                    .enumerate()
                    .map(|(i, val)| {
                        let item_name = format!("{}.{}", arg_name, i).as_str().intern();
                        self.build_argument(item_name, val)
                    })
                    .collect::<Vec<_>>(),
            })),
            Value::Object(object) => {
                let mut sorted_object = object.clone();
                sorted_object.sort_by_key(|arg| arg.name);
                Some(ConcreteArgument::ObjectValue(ConcreteObjectArgument {
                    name: arg_name,
                    fields: sorted_object
                        .iter()
                        .map(|arg| {
                            let field_name = arg.name.item;
                            if let Some(concrete_arg) =
                                self.build_argument(field_name, &arg.value.item)
                            {
                                concrete_arg
                            } else {
                                // For object types, we do want to keep the literal argument
                                // for null, instead of filtering it out, matching JS behavior
                                ConcreteArgument::Literal(ConcreteLiteralArgument {
                                    name: field_name,
                                    type_: None,
                                    value: json!(null),
                                })
                            }
                        })
                        .collect::<Vec<_>>(),
                }))
            }
        }
    }

    fn build_constant_argument(
        &self,
        arg_name: StringKey,
        arg_value: &ConstantValue,
    ) -> Option<ConcreteLiteralArgument> {
        match arg_value {
            // We return None here to filter out "null" arguments, matching JS behavior
            ConstantValue::Null() => None,
            _ => Some(ConcreteLiteralArgument {
                name: arg_name,
                type_: None,
                value: json!(null), // TODO: self.build_constant_value(arg_value),
            }),
        }
    }

    fn build_constant_value(&mut self, value: &ConstantValue) -> Primitive {
        match value {
            ConstantValue::Int(val) => Primitive::Int(*val),
            ConstantValue::Float(val) => Primitive::Float(*val),
            ConstantValue::String(val) => Primitive::String(*val),
            ConstantValue::Boolean(val) => Primitive::Bool(*val),
            ConstantValue::Null() => Primitive::Null,
            ConstantValue::Enum(val) => Primitive::String(*val),
            ConstantValue::List(val_list) => {
                let json_values = val_list
                    .iter()
                    .map(|val| self.build_constant_value(val))
                    .collect::<Vec<_>>();
                Primitive::Key(self.array(json_values))
            }
            ConstantValue::Object(val_object) => {
                let json_values = val_object
                    .iter()
                    .map(|arg| (arg.name.item, self.build_constant_value(&arg.value.item)))
                    .collect::<Vec<_>>();
                Primitive::Key(self.object(json_values))
            }
        }
    }
}

/// Tries to convert a `ConcreteArgument` into a `serde_json::Value`.
/// Returns `None`, if it contains a `Variable` somewhere
fn try_argument_value_to_serde(arg: &ConcreteArgument) -> Option<SerdeValue> {
    match arg {
        ConcreteArgument::Variable(_) => {
            // Unable to print a static storage key, abort.
            None
        }
        ConcreteArgument::Literal(val) => Some(val.value.clone()),
        ConcreteArgument::ListValue(list_arg) => {
            let mut json_values = Vec::with_capacity(list_arg.items.len());
            for item in &list_arg.items {
                if let Some(item_value) = item {
                    let item_json = try_argument_value_to_serde(item_value)?;
                    json_values.push(item_json);
                } else {
                    json_values.push(json!(null));
                }
            }
            Some(json!(json_values))
        }
        ConcreteArgument::ObjectValue(object_arg) => {
            let mut map = SerdeMap::with_capacity(object_arg.fields.len());
            for arg in &object_arg.fields {
                let field_value = try_argument_value_to_serde(arg)?;
                let field_name = arg.name().lookup().to_string();
                map.insert(field_name, field_value);
            }
            Some(json!(map))
        }
    }
}

/// Pre-computes storage key if possible and advantageous. Storage keys are
/// generated for fields with supplied arguments that are all statically known
/// (ie. literals, no variables) at build time.
fn get_static_storage_key(
    field_name: StringKey,
    arguments: &Option<Vec<ConcreteArgument>>, /*_metadata: ?*/
) -> Option<String> {
    // TODO (T64585375): JS compiler has an option to force a storageKey.
    if let Some(arguments) = arguments {
        let mut static_args = Vec::new();
        for arg in arguments {
            // Abort if the argument cannot be converted statically.
            let arg_value = try_argument_value_to_serde(arg)?;
            static_args.push((arg.name(), arg_value));
        }
        if static_args.is_empty() {
            None
        } else {
            let mut key = format!("{}(", field_name);
            let mut first = true;
            for (arg_name, arg_value) in static_args {
                if first {
                    first = false;
                } else {
                    key.push(',');
                }
                key.push_str(arg_name.lookup());
                key.push(':');
                key.push_str(&serde_json::to_string(&arg_value).unwrap());
            }
            key.push(')');
            Some(key)
        }
    } else {
        None
    }
}

fn build_module_import_selection(directive: &Directive) -> ConcreteSelection {
    let fragment_name = directive
        .arguments
        .named(MATCH_CONSTANTS.name_arg)
        .unwrap()
        .value
        .item
        .get_string_literal()
        .unwrap();
    let key = directive
        .arguments
        .named(MATCH_CONSTANTS.key_arg)
        .unwrap()
        .value
        .item
        .get_string_literal()
        .unwrap();
    let fragment_name_str = fragment_name.lookup();
    let underscore_idx = fragment_name_str.find('_').unwrap_or_else(|| {
        panic!(
            "@module fragments should be named 'FragmentName_propName', got '{}'.",
            fragment_name
        )
    });
    ConcreteSelection::ModuleImport(ConcreteModuleImport {
        document_name: key,
        fragment_name,
        fragment_prop_name: fragment_name_str[underscore_idx + 1..].intern(),
    })
}
