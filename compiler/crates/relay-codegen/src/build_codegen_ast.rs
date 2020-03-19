/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::codegen_ast::*;
use graphql_ir::{
    Argument, Condition, ConditionValue, ConstantValue, FragmentDefinition, FragmentSpread,
    InlineFragment, LinkedField, OperationDefinition, ScalarField, Selection, Value,
    VariableDefinition,
};
use std::iter;

use graphql_syntax::OperationKind;
use graphql_transforms::{
    extract_connection_metadata_from_directive, extract_handle_field_directives,
    extract_relay_directive, extract_values_from_handle_field_directive, ConnectionConstants,
    HandleFieldConstants, RELAY_DIRECTIVE_CONSTANTS,
};

use interner::{Intern, StringKey};
use schema::{Schema, TypeReference};
use serde_json::{json, Map as SerdeMap, Value as SerdeValue};

pub fn build_request(
    schema: &Schema,
    operation: &OperationDefinition,
    fragment: &FragmentDefinition,
) -> ConcreteRequest {
    ConcreteRequest {
        kind: "ConcreteRequest",
        fragment: build_fragment(schema, fragment),
        operation: build_operation(schema, operation),
        params: build_request_params(schema, operation),
    }
}

pub fn build_request_params(
    _schema: &Schema,
    operation: &OperationDefinition,
) -> RequestParameters {
    RequestParameters {
        name: operation.name.item,
        operation_kind: match operation.kind {
            OperationKind::Query => ConcreteOperationKind::Query,
            OperationKind::Mutation => ConcreteOperationKind::Mutation,
            OperationKind::Subscription => ConcreteOperationKind::Subscription,
        },
        metadata: Default::default(),
        // TODO(T63303793) add persisted query id / text
        id: None,
        text: None,
    }
}

pub fn build_operation(schema: &Schema, operation: &OperationDefinition) -> ConcreteDefinition {
    let builder = CodegenBuilder::new(schema, CodegenVariant::Normalization);
    builder.build_operation(operation)
}

pub fn build_fragment(schema: &Schema, fragment: &FragmentDefinition) -> ConcreteDefinition {
    let builder = CodegenBuilder::new(schema, CodegenVariant::Reader);
    builder.build_fragment(fragment)
}

struct CodegenBuilder<'schema> {
    connection_constants: ConnectionConstants,
    handle_field_constants: HandleFieldConstants,
    schema: &'schema Schema,
    variant: CodegenVariant,
}

enum CodegenVariant {
    Reader,
    Normalization,
}

impl<'schema> CodegenBuilder<'schema> {
    fn new(schema: &'schema Schema, variant: CodegenVariant) -> Self {
        Self {
            connection_constants: Default::default(),
            handle_field_constants: Default::default(),
            schema,
            variant,
        }
    }

    fn build_operation(&self, operation: &OperationDefinition) -> ConcreteDefinition {
        ConcreteDefinition::Operation(ConcreteOperation {
            name: operation.name.item,
            argument_definitions: self
                .build_operation_variable_definitions(&operation.variable_definitions),
            selections: self.build_selections(&operation.selections),
        })
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
            Selection::FragmentSpread(frag_spread) => vec![ConcreteSelection::FragmentSpread(
                self.build_fragment_spread(&frag_spread),
            )],
            Selection::InlineFragment(inline_frag) => {
                vec![self.build_inline_fragment(&inline_frag)]
            }
            Selection::LinkedField(field) => self.build_linked_field_and_handles(field),
            Selection::ScalarField(field) => self.build_scalar_field_and_handles(field),
        }
    }

    fn build_scalar_field_and_handles(&self, field: &ScalarField) -> Vec<ConcreteSelection> {
        if let CodegenVariant::Normalization = self.variant {
            // TODO(T63303873) check for skipNormalizationNode metadata
            return vec![self.build_scalar_field(field)];
        }

        iter::once(self.build_scalar_field(field))
            .chain(self.build_scalar_handles(field))
            .collect::<Vec<_>>()
    }

    fn build_scalar_field(&self, field: &ScalarField) -> ConcreteSelection {
        let field_name = self.schema.field(field.definition.item).name;
        ConcreteSelection::ScalarField(ConcreteScalarField {
            alias: match field.alias {
                Some(alias) => Some(alias.item),
                None => None,
            },
            name: field_name,
            args: self.build_arguments(&field.arguments),
            storage_key: get_static_storage_key(field_name, &field.arguments),
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

    fn build_linked_field_and_handles(
        &self,
        field: &'schema LinkedField,
    ) -> Vec<ConcreteSelection> {
        if let CodegenVariant::Normalization = self.variant {
            return vec![self.build_linked_field(field)];
        }

        iter::once(self.build_linked_field(field))
            .chain(self.build_linked_handles(field))
            .collect::<Vec<_>>()
    }

    fn build_linked_field(&self, field: &LinkedField) -> ConcreteSelection {
        let schema_field = self.schema.field(field.definition.item);
        let field_name = schema_field.name;
        ConcreteSelection::LinkedField(ConcreteLinkedField {
            alias: match field.alias {
                Some(alias) => Some(alias.item),
                None => None,
            },
            name: field_name,
            args: self.build_arguments(&field.arguments),
            selections: self.build_selections(&field.selections),
            concrete_type: if self.schema.is_abstract_type(schema_field.type_.inner()) {
                Some(self.schema.get_type_name(schema_field.type_.inner()))
            } else {
                None
            },
            storage_key: get_static_storage_key(field_name, &field.arguments),
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

    fn build_fragment_spread(&self, frag_spread: &FragmentSpread) -> ConcreteFragmentSpread {
        ConcreteFragmentSpread {
            name: frag_spread.fragment.item,
            args: self.build_arguments(&frag_spread.arguments),
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
            Some(type_condition) => ConcreteSelection::InlineFragment(ConcreteInlineFragment {
                type_: self.schema.get_type_name(type_condition),
                selections: self.build_selections(&inline_frag.selections),
            }),
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
        &self,
        variable_definitions: &[VariableDefinition],
    ) -> Vec<ConcreteVariableDefinition> {
        let mut var_defs = variable_definitions
            .iter()
            .map(|def| {
                ConcreteVariableDefinition::LocalArgument(ConcreteLocalVariableDefinition {
                    name: def.name.item,
                    type_: self.build_variable_type(&def.type_),
                    default_value: if let Some(const_val) = &def.default_value {
                        self.build_constant_value(&const_val)
                    } else {
                        json!(null)
                    },
                })
            })
            .collect::<Vec<_>>();

        var_defs.sort_by_key(|var_def| var_def.name().lookup());
        var_defs
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
                default_value: if let Some(const_val) = &def.default_value {
                    self.build_constant_value(&const_val)
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
        let mut var_defs = local_vars_iter.chain(global_vars_iter).collect::<Vec<_>>();
        var_defs.sort_by_key(|var_def| var_def.name().lookup());
        var_defs
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
                value: self.build_constant_value(arg_value),
            }),
        }
    }

    fn build_constant_value(&self, value: &ConstantValue) -> SerdeValue {
        match value {
            ConstantValue::Int(val) => json!(val),
            ConstantValue::Float(val) => json!(val.as_float()),
            ConstantValue::String(val) => json!(val),
            ConstantValue::Boolean(val) => json!(val),
            ConstantValue::Null() => json!(null),
            ConstantValue::Enum(val) => json!(val),
            ConstantValue::List(val_list) => {
                let json_values = val_list
                    .iter()
                    .map(|val| self.build_constant_value(val))
                    .collect::<Vec<SerdeValue>>();
                json!(json_values)
            }
            ConstantValue::Object(val_object) => {
                let mut map: SerdeMap<String, SerdeValue> =
                    SerdeMap::with_capacity(val_object.len());
                for arg in val_object.iter() {
                    let field_name = String::from(arg.name.item.lookup());
                    map.insert(field_name, self.build_constant_value(&arg.value.item));
                }
                json!(map)
            }
        }
    }
}

fn get_static_storage_key(
    _field_name: StringKey,
    _arguments: &[Argument], /*_metadata: ?*/
) -> Option<String> {
    // TODO(T63303994) implementation + properly using metadata
    None
}
