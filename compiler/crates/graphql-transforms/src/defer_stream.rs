/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::get_applied_fragment_name;
use crate::util::{find_argument, find_directive, remove_directive, replace_directive};
use common::WithLocation;
use graphql_ir::{
    Argument, ConstantValue, Directive, FragmentDefinition, FragmentSpread, InlineFragment,
    LinkedField, OperationDefinition, Program, ScalarField, Selection, Transformed, Transformer,
    ValidationError, ValidationMessage, ValidationResult, Value,
};
use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use std::{collections::HashMap, sync::Arc};

pub struct DeferStreamConstants {
    pub defer_name: StringKey,
    pub stream_name: StringKey,
    pub if_arg: StringKey,
    pub label_arg: StringKey,
    pub initial_count_arg: StringKey,
    pub use_customized_batch_arg: StringKey,
}

impl Default for DeferStreamConstants {
    fn default() -> Self {
        Self {
            defer_name: "defer".intern(),
            stream_name: "stream".intern(),
            if_arg: "if".intern(),
            label_arg: "label".intern(),
            initial_count_arg: "initial_count".intern(),
            use_customized_batch_arg: "use_customized_batch_arg".intern(),
        }
    }
}

lazy_static! {
    pub static ref DEFER_STREAM_CONSTANTS: DeferStreamConstants = Default::default();
}

pub fn defer_stream<'s>(program: &Program<'s>) -> ValidationResult<Program<'s>> {
    let mut transformer = DeferStreamTransform {
        program,
        current_document_name: None,
        labels: Default::default(),
        errors: Default::default(),
    };
    let next_program = transformer.transform_program(program);

    if transformer.errors.is_empty() {
        Ok(next_program.replace_or_else(|| program.clone()))
    } else {
        Err(transformer.errors)
    }
}

struct DeferStreamTransform<'s> {
    program: &'s Program<'s>,
    current_document_name: Option<StringKey>,
    labels: HashMap<StringKey, Directive>,
    errors: Vec<ValidationError>,
}

impl DeferStreamTransform<'_> {
    fn set_current_document_name(&mut self, document_name: StringKey) {
        self.current_document_name = Some(document_name)
    }

    fn record_label(&mut self, label: StringKey, directive: &Directive) {
        let prev_directive = self.labels.get(&label);
        match prev_directive {
            Some(prev) => {
                self.errors.push(ValidationError::new(
                    ValidationMessage::LabelNotUniqueForDeferStream {
                        directive_name: DEFER_STREAM_CONSTANTS.defer_name,
                    },
                    vec![prev.name.location, directive.name.location],
                ));
            }
            None => {
                self.labels.insert(label, directive.to_owned());
            }
        };
    }
}

impl<'s> Transformer for DeferStreamTransform<'s> {
    const NAME: &'static str = "DeferStreamTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.set_current_document_name(operation.name.item);
        self.default_transform_operation(operation)
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        self.set_current_document_name(fragment.name.item);
        self.default_transform_fragment(fragment)
    }

    fn transform_inline_fragment(
        &mut self,
        inline_fragment: &InlineFragment,
    ) -> Transformed<Selection> {
        let defer_directive = find_directive(
            &inline_fragment.directives,
            DEFER_STREAM_CONSTANTS.defer_name,
        );
        if let Some(directive) = defer_directive {
            self.errors.push(ValidationError::new(
                ValidationMessage::InvalidDeferOnInlineFragment,
                vec![directive.name.location],
            ));
        }

        self.default_transform_inline_fragment(inline_fragment)
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        let defer_directive = find_directive(&spread.directives, DEFER_STREAM_CONSTANTS.defer_name);
        match defer_directive {
            Some(defer) => {
                let if_arg = find_argument(&defer.arguments, DEFER_STREAM_CONSTANTS.if_arg);
                if let Some(arg) = if_arg {
                    if is_literal_false(arg) {
                        return Transformed::Replace(Selection::FragmentSpread(Arc::new(
                            FragmentSpread {
                                directives: remove_directive(&spread.directives, defer.name.item),
                                ..spread.clone()
                            },
                        )));
                    }
                }

                match get_literal_string_argument(&defer, DEFER_STREAM_CONSTANTS.label_arg) {
                    Ok(label_value) => {
                        let is_user_provided_label_empty = label_value == None;
                        let label = label_value.unwrap_or_else(|| {
                            get_applied_fragment_name(spread.fragment.item, &spread.arguments)
                        });

                        let transformed_label = transform_label(
                            self.current_document_name
                                .expect("We expect the parent name to be defined here."),
                            DEFER_STREAM_CONSTANTS.defer_name,
                            label,
                        );
                        self.record_label(transformed_label, defer);
                        let next_label_value =
                            Value::Constant(ConstantValue::String(transformed_label));

                        let next_arguments = if is_user_provided_label_empty {
                            let mut args = defer.arguments.to_owned();
                            args.push(Argument {
                                name: WithLocation {
                                    item: DEFER_STREAM_CONSTANTS.label_arg,
                                    location: defer.name.location,
                                },
                                value: WithLocation {
                                    item: next_label_value,
                                    location: defer.name.location,
                                },
                            });
                            args
                        } else {
                            replace_argument_value(
                                &defer.arguments,
                                DEFER_STREAM_CONSTANTS.label_arg,
                                next_label_value,
                            )
                        };

                        let next_defer = Directive {
                            name: defer.name,
                            arguments: next_arguments,
                        };

                        Transformed::Replace(Selection::FragmentSpread(Arc::new(FragmentSpread {
                            directives: replace_directive(&spread.directives, next_defer),
                            ..spread.clone()
                        })))
                    }

                    Err(error) => {
                        self.errors.push(error);
                        Transformed::Keep
                    }
                }
            }
            None => self.default_transform_fragment_spread(spread),
        }
    }

    fn transform_scalar_field(&mut self, scalar_field: &ScalarField) -> Transformed<Selection> {
        let stream_directive =
            find_directive(&scalar_field.directives, DEFER_STREAM_CONSTANTS.stream_name);
        if let Some(directive) = stream_directive {
            self.errors.push(ValidationError::new(
                ValidationMessage::InvalidStreamOnScalarField {
                    field_name: scalar_field.alias_or_name(self.program.schema()),
                },
                vec![directive.name.location],
            ));
        }

        self.default_transform_scalar_field(scalar_field)
    }

    fn transform_linked_field(&mut self, linked_field: &LinkedField) -> Transformed<Selection> {
        let stream_directive =
            find_directive(&linked_field.directives, DEFER_STREAM_CONSTANTS.stream_name);
        match stream_directive {
            Some(stream) => {
                let if_arg = find_argument(&stream.arguments, DEFER_STREAM_CONSTANTS.if_arg);
                if let Some(arg) = if_arg {
                    if is_literal_false(arg) {
                        return Transformed::Replace(Selection::LinkedField(Arc::new(
                            LinkedField {
                                directives: remove_directive(
                                    &linked_field.directives,
                                    stream.name.item,
                                ),
                                ..linked_field.clone()
                            },
                        )));
                    }
                }

                let initial_count_arg =
                    find_argument(&stream.arguments, DEFER_STREAM_CONSTANTS.initial_count_arg);
                if initial_count_arg == None {
                    self.errors.push(ValidationError::new(
                        ValidationMessage::StreamInitialCountRequired,
                        vec![stream.name.location],
                    ));
                    return Transformed::Keep;
                }

                match get_literal_string_argument(&stream, DEFER_STREAM_CONSTANTS.label_arg) {
                    Ok(label_value) => {
                        let is_user_provided_label_empty = label_value == None;
                        let label = label_value.unwrap_or_else(|| {
                            get_applied_fragment_name(
                                linked_field.alias_or_name(self.program.schema()),
                                &linked_field.arguments,
                            )
                        });

                        let transformed_label = transform_label(
                            self.current_document_name
                                .expect("We expect the parent name to be defined here."),
                            DEFER_STREAM_CONSTANTS.stream_name,
                            label,
                        );

                        self.record_label(transformed_label, stream);

                        let next_label_value =
                            Value::Constant(ConstantValue::String(transformed_label));
                        let next_arguments = if is_user_provided_label_empty {
                            let mut args = stream.arguments.to_owned();
                            args.push(Argument {
                                name: WithLocation {
                                    item: DEFER_STREAM_CONSTANTS.label_arg,
                                    location: stream.name.location,
                                },
                                value: WithLocation {
                                    item: next_label_value,
                                    location: stream.name.location,
                                },
                            });
                            args
                        } else {
                            replace_argument_value(
                                &stream.arguments,
                                DEFER_STREAM_CONSTANTS.label_arg,
                                next_label_value,
                            )
                        };

                        let next_stream = Directive {
                            name: stream.name,
                            arguments: next_arguments,
                        };

                        Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
                            directives: replace_directive(&linked_field.directives, next_stream),
                            ..linked_field.clone()
                        })))
                    }
                    Err(error) => {
                        self.errors.push(error);
                        Transformed::Keep
                    }
                }
            }
            None => self.default_transform_linked_field(linked_field),
        }
    }
}

fn is_literal_false(arg: &Argument) -> bool {
    match arg.value.item {
        Value::Constant(ConstantValue::Boolean(val)) => !val,
        _ => false,
    }
}

fn transform_label(
    parent_name: StringKey,
    directive_name: StringKey,
    label: StringKey,
) -> StringKey {
    format!("{}${}${}", parent_name, directive_name, label).intern()
}

fn get_literal_string_argument(
    directive: &Directive,
    arg_name: StringKey,
) -> Result<Option<StringKey>, ValidationError> {
    let argument = find_argument(&directive.arguments, arg_name);
    match argument {
        Some(arg) => match arg.value.item {
            Value::Constant(ConstantValue::String(val)) => Ok(Some(val)),
            _ => Err(ValidationError::new(
                ValidationMessage::LiteralStringArgumentExpectedForDirective {
                    arg_name: DEFER_STREAM_CONSTANTS.label_arg,
                    directive_name: directive.name.item,
                },
                vec![directive.name.location],
            )),
        },
        None => Ok(None),
    }
}

fn replace_argument_value(
    current_arguments: &[Argument],
    replacement_name: StringKey,
    value: Value,
) -> Vec<Argument> {
    current_arguments
        .iter()
        .map(|arg| {
            if arg.name.item == replacement_name {
                return Argument {
                    name: arg.name,
                    value: WithLocation {
                        location: arg.value.location,
                        item: value.to_owned(),
                    },
                };
            }
            arg.to_owned()
        })
        .collect()
}
