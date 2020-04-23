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
use fnv::FnvHashSet;
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

pub fn build_request(
    schema: &Schema,
    ast_builder: &mut AstBuilder,
    operation: &OperationDefinition,
    fragment: &FragmentDefinition,
    request_parameters: RequestParameters,
) -> AstKey {
    let mut operation_builder =
        CodegenBuilder::new(schema, CodegenVariant::Normalization, ast_builder);
    let operation = Primitive::Key(operation_builder.build_operation(operation));
    let mut fragment_builder = CodegenBuilder::new(schema, CodegenVariant::Reader, ast_builder);
    let fragment = Primitive::Key(fragment_builder.build_fragment(fragment));
    let params = intern_request_parameters(ast_builder, request_parameters);
    ast_builder.intern(Ast::Object(vec![
        (CODEGEN_CONSTANTS.fragment, fragment),
        (
            CODEGEN_CONSTANTS.kind,
            Primitive::String(CODEGEN_CONSTANTS.request),
        ),
        (CODEGEN_CONSTANTS.operation, operation),
        (CODEGEN_CONSTANTS.params, params),
    ]))
}

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
) -> AstKey {
    let mut builder = CodegenBuilder::new(schema, CodegenVariant::Reader, ast_builder);
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

    fn object(&mut self, object: Vec<(StringKey, Primitive)>) -> AstKey {
        self.ast_builder.intern(Ast::Object(object))
    }

    fn array(&mut self, array: Vec<Primitive>) -> AstKey {
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
                let selections = self.build_selections(&operation.selections);
                self.object(vec![
                    (
                        CODEGEN_CONSTANTS.kind,
                        Primitive::String(CODEGEN_CONSTANTS.split_operation),
                    ),
                    (
                        CODEGEN_CONSTANTS.name,
                        Primitive::String(operation.name.item),
                    ),
                    (CODEGEN_CONSTANTS.selections, selections),
                    (CODEGEN_CONSTANTS.metadata, metadata),
                ])
            }
            None => {
                let argument_definitions =
                    self.build_operation_variable_definitions(&operation.variable_definitions);
                let selections = self.build_selections(&operation.selections);
                self.object(vec![
                    (CODEGEN_CONSTANTS.argument_definitions, argument_definitions),
                    (
                        CODEGEN_CONSTANTS.kind,
                        Primitive::String(CODEGEN_CONSTANTS.operation_value),
                    ),
                    (
                        CODEGEN_CONSTANTS.name,
                        Primitive::String(operation.name.item),
                    ),
                    (CODEGEN_CONSTANTS.selections, selections),
                ])
            }
        }
    }

    fn build_fragment(&mut self, fragment: &FragmentDefinition) -> AstKey {
        let connection_metadata = if let Some(metadata_values) =
            extract_connection_metadata_from_directive(
                &fragment.directives,
                self.connection_constants,
            ) {
            let array = metadata_values
                .iter()
                .map(|metadata| {
                    let path = match &metadata.path {
                        None => Primitive::Null,
                        Some(path) => Primitive::Key(
                            self.array(path.iter().cloned().map(Primitive::String).collect()),
                        ),
                    };
                    let object = vec![
                        (
                            CODEGEN_CONSTANTS.count,
                            Primitive::string_or_null(metadata.count),
                        ),
                        (
                            CODEGEN_CONSTANTS.cursor,
                            Primitive::string_or_null(metadata.cursor),
                        ),
                        (
                            CODEGEN_CONSTANTS.direction,
                            Primitive::String(metadata.direction),
                        ),
                        (CODEGEN_CONSTANTS.path, path),
                    ];
                    Primitive::Key(self.object(object))
                })
                .collect::<Vec<_>>();
            Some(Primitive::Key(self.array(array)))
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

        let mut metadata = vec![];
        if let Some(connection_metadata) = connection_metadata {
            metadata.push((CODEGEN_CONSTANTS.connection, connection_metadata))
        }
        if let Some(mask) = mask {
            metadata.push((CODEGEN_CONSTANTS.mask, Primitive::Bool(mask)))
        }
        if let Some(plural) = mask {
            metadata.push((CODEGEN_CONSTANTS.plural, Primitive::Bool(plural)))
        }
        // TODO: refetch metadata

        let object = vec![
            (
                CODEGEN_CONSTANTS.argument_definitions,
                self.build_fragment_variable_definitions(
                    &fragment.variable_definitions,
                    &fragment.used_global_variables,
                ),
            ),
            (
                CODEGEN_CONSTANTS.kind,
                Primitive::String(CODEGEN_CONSTANTS.fragment_value),
            ),
            // TODO(T63303840) include correct fragment metadata
            (
                CODEGEN_CONSTANTS.metadata,
                if metadata.is_empty() {
                    Primitive::Null
                } else {
                    Primitive::Key(self.object(metadata))
                },
            ),
            (
                CODEGEN_CONSTANTS.name,
                Primitive::String(fragment.name.item),
            ),
            (
                CODEGEN_CONSTANTS.selections,
                self.build_selections(&fragment.selections),
            ),
            (
                CODEGEN_CONSTANTS.type_,
                Primitive::String(self.schema.get_type_name(fragment.type_condition)),
            ),
        ];
        self.object(object)
    }

    fn build_selections(&mut self, selections: &[Selection]) -> Primitive {
        let selections = selections
            .iter()
            .flat_map(|selection| self.build_selections_from_selection(selection))
            .collect();
        Primitive::Key(self.array(selections))
    }

    fn build_selections_from_selection(&mut self, selection: &Selection) -> Vec<Primitive> {
        match selection {
            // TODO(T63303873) Normalization handles
            Selection::Condition(cond) => vec![self.build_condition(&cond)],
            Selection::FragmentSpread(frag_spread) => {
                let defer = frag_spread
                    .directives
                    .named(DEFER_STREAM_CONSTANTS.defer_name);
                match defer {
                    Some(defer) => vec![self.build_defer(&frag_spread, defer)],
                    None => vec![self.build_fragment_spread(&frag_spread)],
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

    fn build_scalar_field_and_handles(&mut self, field: &ScalarField) -> Vec<Primitive> {
        // TODO(T63303873) check for skipNormalizationNode metadata
        match self.variant {
            CodegenVariant::Reader => vec![self.build_scalar_field(field)],
            CodegenVariant::Normalization => {
                let mut result = vec![self.build_scalar_field(field)];
                self.build_scalar_handles(&mut result, field);
                result
            }
        }
    }

    fn build_scalar_field(&mut self, field: &ScalarField) -> Primitive {
        let schema_field = self.schema.field(field.definition.item);
        let (name, alias) =
            self.build_field_name_and_alias(schema_field.name, field.alias, &field.directives);
        let args = self.build_arguments(&field.arguments);
        Primitive::Key(self.object(vec![
            (CODEGEN_CONSTANTS.alias, Primitive::string_or_null(alias)),
            (
                CODEGEN_CONSTANTS.args,
                match args {
                    None => Primitive::Null,
                    Some(key) => Primitive::Key(key),
                },
            ),
            (
                CODEGEN_CONSTANTS.kind,
                Primitive::String(CODEGEN_CONSTANTS.scalar_field),
            ),
            (CODEGEN_CONSTANTS.name, Primitive::String(name)),
            (
                CODEGEN_CONSTANTS.storage_key,
                match args {
                    None => Primitive::Null,
                    Some(key) => {
                        if is_static_storage_key_available(&field.arguments) {
                            Primitive::StorageKey(name, key)
                        } else {
                            Primitive::Null
                        }
                    }
                },
            ),
        ]))
    }

    fn build_scalar_handles(&mut self, result: &mut Vec<Primitive>, field: &ScalarField) {
        let schema_field = self.schema.field(field.definition.item);
        let field_name = schema_field.name;
        let handle_field_directives =
            extract_handle_field_directives(&field.directives, self.handle_field_constants);

        for directive in handle_field_directives {
            let values = extract_values_from_handle_field_directive(
                &directive,
                self.handle_field_constants,
                None,
                None,
            );
            let filters = match values.filters {
                None => Primitive::Null,
                Some(strs) => {
                    Primitive::Key(self.array(strs.into_iter().map(Primitive::String).collect()))
                }
            };
            let arguments = match self.build_arguments(&field.arguments) {
                None => Primitive::Null,
                Some(key) => Primitive::Key(key),
            };
            result.push(Primitive::Key(self.object(vec![
                (
                    CODEGEN_CONSTANTS.alias,
                    match field.alias {
                        None => Primitive::Null,
                        Some(alias) => Primitive::String(alias.item),
                    },
                ),
                (CODEGEN_CONSTANTS.args, arguments),
                (CODEGEN_CONSTANTS.filters, filters),
                (
                    CODEGEN_CONSTANTS.kind,
                    Primitive::String(CODEGEN_CONSTANTS.scalar_handle),
                ),
                (CODEGEN_CONSTANTS.handle, Primitive::String(values.handle)),
                (CODEGEN_CONSTANTS.key, Primitive::String(values.key)),
                (CODEGEN_CONSTANTS.name, Primitive::String(field_name)),
            ])))
        }
    }

    fn build_linked_field_and_handles(&mut self, field: &LinkedField) -> Vec<Primitive> {
        match self.variant {
            CodegenVariant::Reader => vec![self.build_linked_field(field)],
            CodegenVariant::Normalization => {
                let mut result = vec![self.build_linked_field(field)];
                self.build_linked_handles(&mut result, field);
                result
            }
        }
    }

    fn build_linked_field(&mut self, field: &LinkedField) -> Primitive {
        let schema_field = self.schema.field(field.definition.item);
        let (name, alias) =
            self.build_field_name_and_alias(schema_field.name, field.alias, &field.directives);
        let args = self.build_arguments(&field.arguments);
        let selections = self.build_selections(&field.selections);
        Primitive::Key(self.object(vec![
            (CODEGEN_CONSTANTS.alias, Primitive::string_or_null(alias)),
            (
                CODEGEN_CONSTANTS.args,
                match args {
                    None => Primitive::Null,
                    Some(key) => Primitive::Key(key),
                },
            ),
            (
                CODEGEN_CONSTANTS.concrete_type,
                if self.schema.is_abstract_type(schema_field.type_.inner()) {
                    Primitive::Null
                } else {
                    Primitive::String(self.schema.get_type_name(schema_field.type_.inner()))
                },
            ),
            (
                CODEGEN_CONSTANTS.kind,
                Primitive::String(CODEGEN_CONSTANTS.linked_field),
            ),
            (CODEGEN_CONSTANTS.name, Primitive::String(name)),
            (
                CODEGEN_CONSTANTS.plural,
                Primitive::Bool(schema_field.type_.is_list()),
            ),
            (CODEGEN_CONSTANTS.selections, selections),
            (
                CODEGEN_CONSTANTS.storage_key,
                match args {
                    None => Primitive::Null,
                    Some(key) => {
                        if is_static_storage_key_available(&field.arguments) {
                            Primitive::StorageKey(name, key)
                        } else {
                            Primitive::Null
                        }
                    }
                },
            ),
        ]))
    }

    fn build_linked_handles(&mut self, result: &mut Vec<Primitive>, field: &LinkedField) {
        let schema_field = self.schema.field(field.definition.item);
        let field_name = schema_field.name;
        let handle_field_directives =
            extract_handle_field_directives(&field.directives, self.handle_field_constants);
        for directive in handle_field_directives {
            let values = extract_values_from_handle_field_directive(
                &directive,
                self.handle_field_constants,
                None,
                None,
            );

            let dynamic_key = match &values.dynamic_key {
                Some(val) => self.build_argument(CODEGEN_CONSTANTS.dynamic_key_argument, val),
                None => None,
            };
            let filters = match values.filters {
                None => Primitive::Null,
                Some(strs) => {
                    Primitive::Key(self.array(strs.into_iter().map(Primitive::String).collect()))
                }
            };
            let mut object = vec![
                (
                    CODEGEN_CONSTANTS.alias,
                    match field.alias {
                        Some(alias) => Primitive::String(alias.item),
                        None => Primitive::Null,
                    },
                ),
                (
                    CODEGEN_CONSTANTS.args,
                    match self.build_arguments(&field.arguments) {
                        None => Primitive::Null,
                        Some(key) => Primitive::Key(key),
                    },
                ),
                (CODEGEN_CONSTANTS.filters, filters),
                (CODEGEN_CONSTANTS.handle, Primitive::String(values.handle)),
                (CODEGEN_CONSTANTS.key, Primitive::String(values.key)),
                (
                    CODEGEN_CONSTANTS.kind,
                    Primitive::String(CODEGEN_CONSTANTS.linked_handle),
                ),
                (CODEGEN_CONSTANTS.name, Primitive::String(field_name)),
            ];
            if let Some(dynamic_key) = dynamic_key {
                object.insert(
                    2,
                    (CODEGEN_CONSTANTS.dynamic_key, Primitive::Key(dynamic_key)),
                );
            };
            result.push(Primitive::Key(self.object(object)))
        }
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

    fn build_fragment_spread(&mut self, frag_spread: &FragmentSpread) -> Primitive {
        let args = self.build_arguments(&frag_spread.arguments);
        Primitive::Key(self.object(vec![
            (
                CODEGEN_CONSTANTS.args,
                match args {
                    None => Primitive::Null,
                    Some(key) => Primitive::Key(key),
                },
            ),
            (
                CODEGEN_CONSTANTS.kind,
                Primitive::String(CODEGEN_CONSTANTS.fragment_spread),
            ),
            (
                CODEGEN_CONSTANTS.name,
                Primitive::String(frag_spread.fragment.item),
            ),
        ]))
    }

    fn build_defer(&mut self, frag_spread: &FragmentSpread, defer: &Directive) -> Primitive {
        let next_selections = vec![self.build_fragment_spread(&FragmentSpread {
            directives: remove_directive(
                &frag_spread.directives,
                DEFER_STREAM_CONSTANTS.defer_name,
            ),
            ..frag_spread.to_owned()
        })];
        let next_selections = Primitive::Key(self.array(next_selections));
        Primitive::Key(match self.variant {
            CodegenVariant::Reader => self.object(vec![
                (
                    CODEGEN_CONSTANTS.kind,
                    Primitive::String(CODEGEN_CONSTANTS.defer),
                ),
                (CODEGEN_CONSTANTS.selections, next_selections),
            ]),
            CodegenVariant::Normalization => {
                let if_arg = defer.arguments.named(DEFER_STREAM_CONSTANTS.if_arg);
                let label_arg = defer.arguments.named(DEFER_STREAM_CONSTANTS.label_arg);
                let if_variable_name = extract_variable_name(if_arg);
                let label_name = match label_arg {
                    Some(label_arg) => match label_arg.value.item {
                        Value::Constant(ConstantValue::String(val)) => Some(val),
                        _ => None,
                    },
                    None => None,
                }
                .unwrap();

                self.object(vec![
                    (
                        CODEGEN_CONSTANTS.if_,
                        Primitive::string_or_null(if_variable_name),
                    ),
                    (
                        CODEGEN_CONSTANTS.kind,
                        Primitive::String(CODEGEN_CONSTANTS.defer),
                    ),
                    (CODEGEN_CONSTANTS.label, Primitive::String(label_name)),
                    (CODEGEN_CONSTANTS.metadata, Primitive::Null),
                    (CODEGEN_CONSTANTS.selections, next_selections),
                ])
            }
        })
    }

    fn build_stream(&mut self, linked_field: &LinkedField, stream: &Directive) -> Primitive {
        let next_selections = vec![self.build_linked_field(&LinkedField {
            directives: remove_directive(
                &linked_field.directives,
                DEFER_STREAM_CONSTANTS.stream_name,
            ),
            ..linked_field.to_owned()
        })];
        let next_selections = Primitive::Key(self.array(next_selections));
        Primitive::Key(match self.variant {
            CodegenVariant::Reader => self.object(vec![
                (
                    CODEGEN_CONSTANTS.kind,
                    Primitive::String(CODEGEN_CONSTANTS.stream),
                ),
                (CODEGEN_CONSTANTS.selections, next_selections),
            ]),
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
                    Some(label_arg) => match label_arg.value.item {
                        Value::Constant(ConstantValue::String(val)) => Some(val),
                        _ => None,
                    },
                    None => None,
                }
                .unwrap();

                self.object(vec![
                    (
                        CODEGEN_CONSTANTS.if_,
                        Primitive::string_or_null(if_variable_name),
                    ),
                    (
                        CODEGEN_CONSTANTS.kind,
                        Primitive::String(CODEGEN_CONSTANTS.stream),
                    ),
                    (CODEGEN_CONSTANTS.label, Primitive::String(label_name)),
                    (CODEGEN_CONSTANTS.metadata, Primitive::Null),
                    (CODEGEN_CONSTANTS.selections, next_selections),
                    (
                        CODEGEN_CONSTANTS.use_customized_batch,
                        Primitive::string_or_null(use_customized_batch_variable_name),
                    ),
                ])
            }
        })
    }

    fn build_inline_fragment(&mut self, inline_frag: &InlineFragment) -> Primitive {
        match inline_frag.type_condition {
            None => {
                // TODO(T63388023): Use typed custom directives
                if inline_frag.directives.len() == 1
                    && inline_frag.directives[0].name.item == "__clientExtension".intern()
                {
                    let selections = self.build_selections(&inline_frag.selections);
                    Primitive::Key(self.object(vec![
                        (
                            CODEGEN_CONSTANTS.kind,
                            Primitive::String(CODEGEN_CONSTANTS.client_extension),
                        ),
                        (CODEGEN_CONSTANTS.selections, selections),
                    ]))
                } else {
                    // TODO(T63559346): Handle anonymous inline fragments with no directives
                    panic!(
                        "Unexpected custom directives: {:#?}",
                        inline_frag.directives
                    );
                }
            }
            Some(type_condition) => {
                let selections = if inline_frag
                    .directives
                    .named(MATCH_CONSTANTS.custom_module_directive_name)
                    .is_some()
                {
                    Primitive::Null // TODO: build_module_import_selection(&inline_frag.directives[0])])
                } else {
                    self.build_selections(&inline_frag.selections)
                };
                Primitive::Key(self.object(vec![
                    (
                        CODEGEN_CONSTANTS.kind,
                        Primitive::String(CODEGEN_CONSTANTS.inline_fragment),
                    ),
                    (CODEGEN_CONSTANTS.selections, selections),
                    (
                        CODEGEN_CONSTANTS.type_,
                        Primitive::String(self.schema.get_type_name(type_condition)),
                    ),
                ]))
            }
        }
    }

    fn build_condition(&mut self, condition: &Condition) -> Primitive {
        let selections = self.build_selections(&condition.selections);
        Primitive::Key(self.object(vec![
            (
                CODEGEN_CONSTANTS.condition,
                Primitive::String(match &condition.value {
                    ConditionValue::Variable(variable) => variable.name.item,
                    ConditionValue::Constant(_) => panic!(
                        "Expected Condition with static value to have been pruned or inlined."
                    ),
                }),
            ),
            (
                CODEGEN_CONSTANTS.kind,
                Primitive::String(CODEGEN_CONSTANTS.condition_value),
            ),
            (
                CODEGEN_CONSTANTS.passing_value,
                Primitive::Bool(condition.passing_value),
            ),
            (CODEGEN_CONSTANTS.selections, selections),
        ]))
    }

    fn build_variable_type(&self, type_: &TypeReference) -> Primitive {
        Primitive::String(match type_ {
            TypeReference::Named(inner) => self.schema.get_type_name(inner.clone()),
            _ => self.schema.get_type_string(type_).intern(),
        })
    }

    fn build_operation_variable_definitions(
        &mut self,
        variable_definitions: &[VariableDefinition],
    ) -> Primitive {
        let var_defs = variable_definitions
            .iter()
            .map(|def| {
                let default_value = if let Some(const_val) = &def.default_value {
                    self.build_constant_value(&const_val)
                } else {
                    Primitive::Null
                };
                Primitive::Key(self.object(vec![
                    (CODEGEN_CONSTANTS.default_value, default_value),
                    (
                        CODEGEN_CONSTANTS.kind,
                        Primitive::String(CODEGEN_CONSTANTS.local_argument),
                    ),
                    (CODEGEN_CONSTANTS.name, Primitive::String(def.name.item)),
                    (
                        CODEGEN_CONSTANTS.type_,
                        self.build_variable_type(&def.type_),
                    ),
                ]))
            })
            .collect::<Vec<_>>();

        Primitive::Key(self.array(var_defs))
    }

    fn build_fragment_variable_definitions(
        &mut self,
        local_variable_definitions: &[VariableDefinition],
        global_variable_definitions: &[VariableDefinition],
    ) -> Primitive {
        // TODO(T63164787) this will produce argument_definitions in a different order than our JS codegen
        let mut var_defs = Vec::with_capacity(
            local_variable_definitions.len() + global_variable_definitions.len(),
        );
        for def in local_variable_definitions {
            let object = vec![
                (
                    CODEGEN_CONSTANTS.default_value,
                    if let Some(const_val) = &def.default_value {
                        self.build_constant_value(&const_val)
                    } else {
                        Primitive::Null
                    },
                ),
                (
                    CODEGEN_CONSTANTS.kind,
                    Primitive::String(CODEGEN_CONSTANTS.local_argument),
                ),
                (CODEGEN_CONSTANTS.name, Primitive::String(def.name.item)),
                (
                    CODEGEN_CONSTANTS.type_,
                    self.build_variable_type(&def.type_),
                ),
            ];
            var_defs.push(Primitive::Key(self.object(object)));
        }
        for def in global_variable_definitions {
            var_defs.push(Primitive::Key(self.object(vec![
                (
                    CODEGEN_CONSTANTS.kind,
                    Primitive::String(CODEGEN_CONSTANTS.root_argument),
                ),
                (CODEGEN_CONSTANTS.name, Primitive::String(def.name.item)),
                (
                    CODEGEN_CONSTANTS.type_,
                    self.build_variable_type(&def.type_),
                ),
            ])));
        }
        Primitive::Key(self.array(var_defs))
    }

    fn build_arguments(&mut self, arguments: &[Argument]) -> Option<AstKey> {
        let mut sorted_args: Vec<&Argument> = arguments.iter().map(|arg| arg).collect();
        sorted_args.sort_unstable_by_key(|arg| arg.name.item.lookup());

        let args = sorted_args
             .into_iter()
             // We are filtering out "null" arguments matching JS behavior
             .filter_map(|arg| self.build_argument(arg.name.item, &arg.value.item))
             .map(Primitive::Key)
             .collect::<Vec<_>>();
        if args.is_empty() {
            None
        } else {
            Some(self.array(args))
        }
    }

    fn build_argument(&mut self, arg_name: StringKey, arg_value: &Value) -> Option<AstKey> {
        match arg_value {
            Value::Constant(const_val) => {
                if let Some(concrete_const_val) = self.build_constant_argument(arg_name, &const_val)
                {
                    Some(concrete_const_val)
                } else {
                    None
                }
            }
            Value::Variable(variable) => {
                let name = Primitive::String(arg_name);
                let variable_name = Primitive::String(variable.name.item);
                Some(self.object(vec![
                    (
                        CODEGEN_CONSTANTS.kind,
                        Primitive::String(CODEGEN_CONSTANTS.variable),
                    ),
                    (CODEGEN_CONSTANTS.name, name),
                    // TODO(T63303966) type is always skipped in JS compiler
                    (CODEGEN_CONSTANTS.variable_name, variable_name),
                ]))
            }
            Value::List(list) => {
                let items = list
                    .iter()
                    .enumerate()
                    .filter_map(|(i, val)| {
                        let item_name = format!("{}.{}", arg_name, i).as_str().intern();
                        self.build_argument(item_name, val)
                    })
                    .map(Primitive::Key)
                    .collect::<Vec<_>>();
                let object = vec![
                    (CODEGEN_CONSTANTS.name, Primitive::String(arg_name)),
                    (
                        CODEGEN_CONSTANTS.kind,
                        Primitive::String(CODEGEN_CONSTANTS.list_value),
                    ),
                    (CODEGEN_CONSTANTS.items, Primitive::Key(self.array(items))),
                ];
                Some(self.object(object))
            }
            Value::Object(object) => {
                let mut sorted_object = object.clone();
                sorted_object.sort_by_key(|arg| arg.name);
                let fields = sorted_object
                    .into_iter()
                    .map(|arg| {
                        let field_name = arg.name.item;
                        if let Some(concrete_arg) = self.build_argument(field_name, &arg.value.item)
                        {
                            Primitive::Key(concrete_arg)
                        } else {
                            // For object types, we do want to keep the literal argument
                            // for null, instead of filtering it out, matching JS behavior
                            Primitive::Key(self.object(vec![
                                (
                                    CODEGEN_CONSTANTS.kind,
                                    Primitive::String(CODEGEN_CONSTANTS.literal),
                                ),
                                (CODEGEN_CONSTANTS.name, Primitive::String(field_name)),
                                (CODEGEN_CONSTANTS.value, Primitive::Null),
                            ]))
                        }
                    })
                    .collect::<Vec<_>>();
                let object = vec![
                    (CODEGEN_CONSTANTS.fields, Primitive::Key(self.array(fields))),
                    (
                        CODEGEN_CONSTANTS.kind,
                        Primitive::String(CODEGEN_CONSTANTS.object_value),
                    ),
                    (CODEGEN_CONSTANTS.name, Primitive::String(arg_name)),
                ];
                Some(self.object(object))
            }
        }
    }

    fn build_constant_argument(
        &mut self,
        arg_name: StringKey,
        arg_value: &ConstantValue,
    ) -> Option<AstKey> {
        match arg_value {
            // We return None here to filter out "null" arguments, matching JS behavior
            ConstantValue::Null() => None,
            _ => {
                let value = self.build_constant_value(arg_value);
                Some(self.object(vec![
                    (
                        CODEGEN_CONSTANTS.kind,
                        Primitive::String(CODEGEN_CONSTANTS.literal),
                    ),
                    (CODEGEN_CONSTANTS.name, Primitive::String(arg_name)),
                    (CODEGEN_CONSTANTS.value, value),
                ]))
            }
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
                let mut sorted_val_object: Vec<&_> = val_object.iter().collect();
                sorted_val_object.sort_unstable_by_key(|arg| arg.name.item.lookup());

                let json_values = sorted_val_object
                    .into_iter()
                    .map(|arg| (arg.name.item, self.build_constant_value(&arg.value.item)))
                    .collect::<Vec<_>>();
                Primitive::Key(self.object(json_values))
            }
        }
    }
}

// Storage key is only pre-computable if the arguments don't contain variables
fn is_static_storage_key_available(arguments: &[Argument]) -> bool {
    !arguments
        .iter()
        .any(|arg| value_contains_variable(&arg.value.item))
}

fn value_contains_variable(value: &Value) -> bool {
    match value {
        Value::Variable(_) => true,
        Value::Constant(_) => false,
        Value::List(vals) => vals.iter().any(value_contains_variable),
        Value::Object(objs) => objs
            .iter()
            .any(|arg| value_contains_variable(&arg.value.item)),
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

fn intern_request_parameters(
    ast_builder: &mut AstBuilder,
    mut request_parameters: RequestParameters,
) -> Primitive {
    let mut metadata_values: Vec<(String, String)> = request_parameters.metadata.drain().collect();
    metadata_values.sort_unstable_by(|l, r| l.0.cmp(&r.0));

    let object = vec![
        (
            CODEGEN_CONSTANTS.id,
            match request_parameters.id {
                None => Primitive::Null,
                Some(str) => Primitive::RawString(str),
            },
        ),
        (
            CODEGEN_CONSTANTS.metadata,
            Primitive::Key(
                ast_builder.intern(Ast::Object(
                    metadata_values
                        .into_iter()
                        .map(|v| (v.0.intern(), Primitive::RawString(v.1)))
                        .collect(),
                )),
            ),
        ),
        (
            CODEGEN_CONSTANTS.name,
            Primitive::String(request_parameters.name),
        ),
        (
            CODEGEN_CONSTANTS.operation_kind,
            Primitive::String(match request_parameters.operation_kind {
                ConcreteOperationKind::Query => CODEGEN_CONSTANTS.query,
                ConcreteOperationKind::Mutation => CODEGEN_CONSTANTS.mutation,
                ConcreteOperationKind::Subscription => CODEGEN_CONSTANTS.subscription,
            }),
        ),
        (
            CODEGEN_CONSTANTS.text,
            match request_parameters.text {
                None => Primitive::Null,
                Some(text) => Primitive::RawString(text),
            },
        ),
    ];
    Primitive::Key(ast_builder.intern(Ast::Object(object)))
}
