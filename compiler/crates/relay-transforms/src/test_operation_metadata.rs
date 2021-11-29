/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{ValidationMessage, DIRECTIVE_SPLIT_OPERATION, INTERNAL_METADATA_DIRECTIVE};
use common::{Diagnostic, DiagnosticsResult, NamedItem, WithLocation};
use graphql_ir::{
    Argument, ConstantArgument, ConstantValue, Directive, Field as IrField, FragmentDefinition,
    OperationDefinition, Program, Selection, Transformed, Transformer, Value,
};
use indexmap::IndexMap;
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;
use regex::Regex;
use schema::{EnumValue, Field, SDLSchema, Schema, Type};

lazy_static! {
    static ref TEST_OPERATION_DIRECTIVE: StringKey = "relay_test_operation".intern();
    static ref TEST_OPERATION_METADATA_KEY: StringKey = "relayTestingSelectionTypeInfo".intern();
    static ref ENUM_VALUES_KEY: StringKey = "enumValues".intern();
    static ref NULLABLE_KEY: StringKey = "nullable".intern();
    static ref PLURAL_KEY: StringKey = "plural".intern();
    static ref TYPE_KEY: StringKey = "type".intern();
}

/// Transforms the @relay_test_operation directive to @__metadata thats printed
/// as runtime data during codegen.
/// If a `test_path_regex` is passed, only allows the directive in
/// directories matching the regex.
pub fn generate_test_operation_metadata(
    program: &Program,
    test_path_regex: &Option<Regex>,
) -> DiagnosticsResult<Program> {
    let mut transformer = GenerateTestOperationMetadata::new(program, test_path_regex);
    let next_program = transformer
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transformer.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transformer.errors)
    }
}

struct GenerateTestOperationMetadata<'a> {
    program: &'a Program,
    test_path_regex: &'a Option<Regex>,
    errors: Vec<Diagnostic>,
}

impl<'a> GenerateTestOperationMetadata<'a> {
    fn new(program: &'a Program, test_path_regex: &'a Option<Regex>) -> Self {
        GenerateTestOperationMetadata {
            program,
            test_path_regex,
            errors: Vec::new(),
        }
    }
}

impl<'a> Transformer for GenerateTestOperationMetadata<'a> {
    const NAME: &'static str = "GenerateTestOperationMetadata";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        if let Some(test_operation_directive) =
            operation.directives.named(*TEST_OPERATION_DIRECTIVE)
        {
            if let Some(test_path_regex) = self.test_path_regex {
                if !test_path_regex.is_match(operation.name.location.source_location().path()) {
                    self.errors.push(Diagnostic::error(
                        ValidationMessage::TestOperationOutsideTestDirectory {
                            test_path_regex: test_path_regex.to_string(),
                        },
                        test_operation_directive.name.location,
                    ));
                    return Transformed::Keep;
                }
            }

            let mut next_directives = Vec::with_capacity(operation.directives.len());
            for directive in &operation.directives {
                // replace @relay_test_operation with @__metadata
                if directive.name.item == *TEST_OPERATION_DIRECTIVE {
                    next_directives.push(Directive {
                        name: WithLocation::new(
                            operation.name.location,
                            *INTERNAL_METADATA_DIRECTIVE,
                        ),
                        arguments: vec![Argument {
                            name: WithLocation::new(
                                operation.name.location,
                                *TEST_OPERATION_METADATA_KEY,
                            ),
                            value: WithLocation::new(
                                operation.name.location,
                                Value::Constant(ConstantValue::Object(From::from(
                                    RelayTestOperationMetadata::new(
                                        self.program,
                                        &operation.selections,
                                    ),
                                ))),
                            ),
                        }],
                        data: None,
                    });
                } else {
                    next_directives.push(directive.clone());
                }
            }

            Transformed::Replace(OperationDefinition {
                directives: next_directives,
                ..operation.clone()
            })
        } else {
            Transformed::Keep
        }
    }

    fn transform_fragment(&mut self, _: &FragmentDefinition) -> Transformed<FragmentDefinition> {
        Transformed::Keep
    }
}

impl From<RelayTestOperationMetadata> for Vec<ConstantArgument> {
    fn from(test_metadata: RelayTestOperationMetadata) -> Self {
        let mut metadata: Vec<ConstantArgument> =
            Vec::with_capacity(test_metadata.selection_type_info.len());
        for (path, type_info) in test_metadata.selection_type_info {
            metadata.push(ConstantArgument {
                name: WithLocation::generated(path),
                value: WithLocation::generated(ConstantValue::Object(From::from(type_info))),
            })
        }
        metadata
    }
}

impl From<RelayTestOperationSelectionTypeInfo> for Vec<ConstantArgument> {
    fn from(type_info: RelayTestOperationSelectionTypeInfo) -> Self {
        vec![
            ConstantArgument {
                name: WithLocation::generated(*ENUM_VALUES_KEY),
                value: WithLocation::generated(match type_info.enum_values {
                    Some(enums) => ConstantValue::List(
                        enums
                            .iter()
                            .map(|enum_| ConstantValue::String(enum_.value))
                            .collect(),
                    ),
                    None => ConstantValue::Null(),
                }),
            },
            ConstantArgument {
                name: WithLocation::generated(*NULLABLE_KEY),
                value: WithLocation::generated(ConstantValue::Boolean(type_info.nullable)),
            },
            ConstantArgument {
                name: WithLocation::generated(*PLURAL_KEY),
                value: WithLocation::generated(ConstantValue::Boolean(type_info.plural)),
            },
            ConstantArgument {
                name: WithLocation::generated(*TYPE_KEY),
                value: WithLocation::generated(ConstantValue::String(type_info.type_)),
            },
        ]
    }
}

#[derive(Debug, Clone)]
pub struct RelayTestOperationSelectionTypeInfo {
    pub type_: StringKey,
    pub enum_values: Option<Vec<EnumValue>>,
    pub plural: bool,
    pub nullable: bool,
}

impl RelayTestOperationSelectionTypeInfo {
    fn new(schema: &SDLSchema, field: &Field) -> Self {
        let type_ = field.type_.inner();
        RelayTestOperationSelectionTypeInfo {
            type_: schema.get_type_name(type_),
            enum_values: match type_ {
                Type::Enum(enum_id) => Some(schema.enum_(enum_id).values.clone()),
                _ => None,
            },
            plural: field.type_.is_list(),
            nullable: !field.type_.is_non_null(),
        }
    }
}

#[derive(Debug)]
pub struct RelayTestOperationMetadata {
    pub selection_type_info: IndexMap<StringKey, RelayTestOperationSelectionTypeInfo>,
}

impl RelayTestOperationMetadata {
    pub fn new(program: &Program, selections: &[Selection]) -> Self {
        let schema = program.schema.as_ref();
        let mut selection_type_info: IndexMap<StringKey, RelayTestOperationSelectionTypeInfo> =
            Default::default();

        let mut processing_queue: Vec<(Option<StringKey>, &[Selection])> = vec![(None, selections)];
        while !processing_queue.is_empty() {
            if let Some(current_item) = processing_queue.pop() {
                let (path, selections) = current_item;
                for selection in selections {
                    match selection {
                        Selection::ScalarField(scalar_field) => {
                            let field = schema.field(scalar_field.definition.item);
                            if !field.is_extension {
                                let alias_or_name = scalar_field.alias_or_name(schema);
                                let next_path = next_path(path, alias_or_name);
                                selection_type_info.insert(
                                    next_path,
                                    RelayTestOperationSelectionTypeInfo::new(schema, field),
                                );
                            }
                        }
                        Selection::LinkedField(linked_field) => {
                            let field = schema.field(linked_field.definition.item);
                            if !field.is_extension {
                                let alias_or_name = linked_field.alias_or_name(schema);
                                let next_path = next_path(path, alias_or_name);
                                selection_type_info.insert(
                                    next_path,
                                    RelayTestOperationSelectionTypeInfo::new(schema, field),
                                );
                                processing_queue.push((Some(next_path), &linked_field.selections));
                            }
                        }
                        Selection::Condition(condition) => {
                            processing_queue.push((path, &condition.selections));
                        }
                        Selection::InlineFragment(inline_fragment) => {
                            processing_queue.push((path, &inline_fragment.selections));
                        }
                        Selection::FragmentSpread(spread) => {
                            // Must be a shared normalization fragment
                            let operation =
                                program.operation(spread.fragment.item).unwrap_or_else(|| {
                                    panic!("Expected fragment '{}' to exist.", spread.fragment.item)
                                });
                            assert!(
                                operation
                                    .directives
                                    .named(*DIRECTIVE_SPLIT_OPERATION)
                                    .is_some(),
                                "Expected normalization fragment spreads to reference shared normalization asts (SplitOperation)"
                            );
                            processing_queue.push((path, &operation.selections));
                        }
                    }
                }
            }
        }

        RelayTestOperationMetadata {
            selection_type_info,
        }
    }
}

fn next_path(current_path: Option<StringKey>, field_alias_or_name: StringKey) -> StringKey {
    match current_path {
        None => field_alias_or_name,
        Some(path) => format!("{}.{}", path, field_alias_or_name).intern(),
    }
}
