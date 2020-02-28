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
use graphql_syntax::OperationKind;
use graphql_text_printer::print_operation;
use interner::Intern;
use schema::Schema;
use serde_json::{json, Map as SerdeMap, Value as SerdeValue};

#[allow(dead_code)]
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

pub fn build_request_params(schema: &Schema, operation: &OperationDefinition) -> RequestParameters {
    RequestParameters {
        name: operation.name.item.lookup(),
        operation_kind: match operation.kind {
            OperationKind::Query => ConcreteOperationKind::Query,
            OperationKind::Mutation => ConcreteOperationKind::Mutation,
            OperationKind::Subscription => ConcreteOperationKind::Subscription,
        },
        metadata: Default::default(),
        // TODO add persisted query id
        id: None,
        text: Some(print_operation(schema, operation)),
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
    schema: &'schema Schema,
    variant: CodegenVariant,
}

enum CodegenVariant {
    Reader,
    Normalization,
}

impl<'schema> CodegenBuilder<'schema> {
    fn new(schema: &'schema Schema, variant: CodegenVariant) -> Self {
        Self { schema, variant }
    }

    fn build_operation(&self, operation: &OperationDefinition) -> ConcreteDefinition {
        ConcreteDefinition::Operation(ConcreteOperation {
            name: operation.name.item.lookup(),
            argument_definitions: self
                .build_operation_variable_definitions(&operation.variable_definitions),
            selections: self.build_selections(&operation.selections),
        })
    }

    fn build_fragment(&self, fragment: &FragmentDefinition) -> ConcreteDefinition {
        ConcreteDefinition::Fragment(ConcreteFragment {
            name: fragment.name.item.lookup(),
            type_: self.schema.get_type_name(fragment.type_condition).lookup(),
            argument_definitions: self.build_fragment_variable_definitions(
                &fragment.variable_definitions,
                &fragment.used_global_variables,
            ),
            selections: self.build_selections(&fragment.selections),
            // TODO include correct fragment metadata
            metadata: Some(FragmentMetadata {
                connection: None,
                mask: None,
                plural: None,
                refetch: None,
            }),
        })
    }

    fn build_selections(&self, selections: &[Selection]) -> Vec<ConcreteSelection> {
        selections
            .iter()
            .map(|selection| self.build_selection(selection))
            .collect()
    }

    fn build_selection(&self, selection: &Selection) -> ConcreteSelection {
        match selection {
            // TODO Normalization handles, Client extension
            Selection::Condition(cond) => ConcreteSelection::Condition(self.build_condition(&cond)),
            Selection::FragmentSpread(frag_spread) => {
                ConcreteSelection::FragmentSpread(self.build_fragment_spread(&frag_spread))
            }
            Selection::InlineFragment(inline_frag) => {
                ConcreteSelection::InlineFragment(self.build_inline_fragment(&inline_frag))
            }
            Selection::LinkedField(field) => {
                ConcreteSelection::LinkedField(self.build_linked_field(&field))
            }
            Selection::ScalarField(field) => {
                ConcreteSelection::ScalarField(self.build_scalar_field(&field))
            }
        }
    }

    fn build_scalar_field(&self, field: &ScalarField) -> ConcreteScalarField {
        if let CodegenVariant::Normalization = self.variant {
            // TODO check for skipNormalizationNode metadata
        }

        let field_name = self.schema.field(field.definition.item).name.lookup();
        ConcreteScalarField {
            alias: match field.alias {
                Some(alias) => Some(alias.item.lookup()),
                None => None,
            },
            name: field_name,
            args: self.build_arguments(&field.arguments),
            storage_key: get_static_storage_key(field_name, &field.arguments),
        }
    }

    fn build_linked_field(&self, field: &LinkedField) -> ConcreteLinkedField {
        let schema_field = self.schema.field(field.definition.item);
        let field_name = schema_field.name.lookup();
        ConcreteLinkedField {
            alias: match field.alias {
                Some(alias) => Some(alias.item.lookup()),
                None => None,
            },
            name: field_name,
            args: self.build_arguments(&field.arguments),
            selections: self.build_selections(&field.selections),
            concrete_type: if self.schema.is_abstract_type(schema_field.type_.inner()) {
                Some(
                    self.schema
                        .get_type_name(schema_field.type_.inner())
                        .lookup(),
                )
            } else {
                None
            },
            storage_key: get_static_storage_key(field_name, &field.arguments),
            plural: schema_field.type_.is_list(),
        }
    }

    fn build_fragment_spread(&self, frag_spread: &FragmentSpread) -> ConcreteFragmentSpread {
        ConcreteFragmentSpread {
            name: frag_spread.fragment.item.lookup(),
            args: self.build_arguments(&frag_spread.arguments),
        }
    }

    fn build_inline_fragment(&self, inline_frag: &InlineFragment) -> ConcreteInlineFragment {
        ConcreteInlineFragment {
            type_: self
                .schema
                // TODO figure out what to do about non present type condition
                .get_type_name(inline_frag.type_condition.unwrap())
                .lookup(),
            selections: self.build_selections(&inline_frag.selections),
        }
    }

    fn build_condition(&self, condition: &Condition) -> ConcreteCondition {
        ConcreteCondition {
            passing_value: condition.passing_value,
            condition: match &condition.value {
                ConditionValue::Variable(variable) => variable.name.item.lookup(),
                ConditionValue::Constant(_) => {
                    panic!("Expected Condition with static value to have been pruned or inlined.")
                }
            },
            selections: self.build_selections(&condition.selections),
        }
    }

    fn build_operation_variable_definitions(
        &self,
        variable_definitions: &[VariableDefinition],
    ) -> Vec<ConcreteVariableDefinition> {
        variable_definitions
            .iter()
            .map(|def| {
                ConcreteVariableDefinition::LocalArgument(ConcreteLocalVariableDefinition {
                    name: def.name.item.lookup(),
                    type_: self.schema.get_type_name(def.type_.inner()).lookup(),
                    default_value: if let Some(const_val) = &def.default_value {
                        self.build_constant_value(&const_val)
                    } else {
                        json!(null)
                    },
                })
            })
            .collect()
    }

    fn build_fragment_variable_definitions(
        &self,
        local_variable_definitions: &[VariableDefinition],
        global_variable_definitions: &[VariableDefinition],
    ) -> Vec<ConcreteVariableDefinition> {
        // TODO this will produce argument_definitions in a different order than our JS codegen
        let local_vars_iter = local_variable_definitions.iter().map(|def| {
            ConcreteVariableDefinition::LocalArgument(ConcreteLocalVariableDefinition {
                name: def.name.item.lookup(),
                type_: self.schema.get_type_name(def.type_.inner()).lookup(),
                default_value: if let Some(const_val) = &def.default_value {
                    self.build_constant_value(&const_val)
                } else {
                    json!(null)
                },
            })
        });
        let global_vars_iter = global_variable_definitions.iter().map(|def| {
            ConcreteVariableDefinition::RootArgument(ConcreteGlobalVariableDefinition {
                name: def.name.item.lookup(),
                type_: self.schema.get_type_name(def.type_.inner()).lookup(),
            })
        });
        local_vars_iter.chain(global_vars_iter).collect()
    }

    fn build_arguments(&self, arguments: &[Argument]) -> Option<Vec<ConcreteArgument>> {
        let mut args = arguments
            .iter()
            // We are filtering out "null" arguments matching JS behavior
            .filter_map(|arg| self.build_argument(arg.name.item.lookup(), &arg.value.item))
            .collect::<Vec<_>>();
        args.sort_by_key(|arg| arg.name());
        match args.len() {
            0 => None,
            _ => Some(args),
        }
    }

    fn build_argument(
        &self,
        arg_name: &'static str,
        arg_value: &Value,
    ) -> Option<ConcreteArgument> {
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
                    // TODO this is always skipped in JS compiler
                    type_: None,
                    variable_name: variable.name.item.lookup(),
                }))
            }
            Value::List(list) => Some(ConcreteArgument::ListValue(ConcreteListArgument {
                name: arg_name,
                items: list
                    .iter()
                    .enumerate()
                    .map(|(i, val)| {
                        let item_name = format!("{}.{}", arg_name, i).as_str().intern().lookup();
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
                            let field_name = arg.name.item.lookup();
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
        arg_name: &'static str,
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
            ConstantValue::String(val) => json!(val.lookup()),
            ConstantValue::Boolean(val) => json!(val),
            ConstantValue::Null() => json!(null),
            ConstantValue::Enum(val) => json!(val.lookup()),
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
    _field_name: &'static str,
    _arguments: &[Argument], /*_metadata: ?*/
) -> Option<String> {
    // TODO implementation + properly using metadata
    None
}
