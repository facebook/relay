/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod directives;

use std::collections::HashMap;
use std::sync::Arc;

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::Location;
use common::NamedItem;
use common::WithLocation;
pub use directives::DeferDirective;
pub use directives::StreamDirective;
use graphql_ir::Argument;
use graphql_ir::ConstantValue;
use graphql_ir::Directive;
use graphql_ir::Field;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::Value;
use intern::Lookup;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use relay_config::DeferStreamInterface;
use schema::Schema;
use thiserror::Error;

use super::get_applied_fragment_name;
use crate::util::remove_directive;
use crate::util::replace_directive;

pub fn transform_defer_stream(
    program: &Program,
    defer_stream_interface: &DeferStreamInterface,
) -> DiagnosticsResult<Program> {
    let mut transformer = DeferStreamTransform {
        program,
        current_document_name: None,
        labels: Default::default(),
        errors: Default::default(),
        defer_stream_interface,
    };
    let next_program = transformer.transform_program(program);

    if transformer.errors.is_empty() {
        Ok(next_program.replace_or_else(|| program.clone()))
    } else {
        Err(transformer.errors)
    }
}

struct DeferStreamTransform<'s> {
    program: &'s Program,
    current_document_name: Option<StringKey>,
    labels: HashMap<StringKey, Directive>,
    errors: Vec<Diagnostic>,
    defer_stream_interface: &'s DeferStreamInterface,
}

impl DeferStreamTransform<'_> {
    fn set_current_document_name(&mut self, document_name: StringKey) {
        self.current_document_name = Some(document_name)
    }

    fn record_label(
        &mut self,
        label: StringKey,
        directive: &Directive,
        defer_stream_interface: &DeferStreamInterface,
    ) {
        let prev_directive = self.labels.get(&label);
        match prev_directive {
            Some(prev) => {
                self.errors.push(
                    Diagnostic::error(
                        ValidationMessage::LabelNotUniqueForDeferStream {
                            directive_name: defer_stream_interface.defer_name,
                        },
                        prev.name.location,
                    )
                    .annotate("related location", directive.location),
                );
            }
            None => {
                self.labels.insert(label, directive.to_owned());
            }
        };
    }

    fn transform_defer(
        &mut self,
        spread: &FragmentSpread,
        defer: &Directive,
        defer_stream_interface: &DeferStreamInterface,
    ) -> Result<Transformed<Selection>, Diagnostic> {
        let DeferDirective { if_arg, label_arg } =
            DeferDirective::from(defer, defer_stream_interface);

        if is_literal_false_arg(if_arg) {
            return Ok(Transformed::Replace(Selection::FragmentSpread(Arc::new(
                FragmentSpread {
                    directives: remove_directive(&spread.directives, defer.name.item),
                    ..spread.clone()
                },
            ))));
        }

        let label_value = get_literal_string_argument(defer, label_arg)?;
        let label = label_value.unwrap_or_else(|| {
            get_applied_fragment_name(spread.fragment.item, &spread.arguments).0
        });
        let transformed_label = transform_label(
            self.current_document_name
                .expect("We expect the parent name to be defined here."),
            defer_stream_interface.defer_name,
            label,
        );
        self.record_label(transformed_label, defer, defer_stream_interface);
        let next_label_value = Value::Constant(ConstantValue::String(transformed_label));
        let next_label_arg = Argument {
            name: WithLocation {
                item: defer_stream_interface.label_arg,
                location: label_arg.map_or(defer.name.location, |arg| arg.name.location),
            },
            value: WithLocation {
                item: next_label_value,
                location: label_arg.map_or(defer.name.location, |arg| arg.value.location),
            },
        };

        let mut next_arguments = Vec::with_capacity(2);
        next_arguments.push(next_label_arg);
        if let Some(if_arg) = if_arg {
            next_arguments.push(if_arg.clone());
        }

        let next_defer = Directive {
            name: defer.name,
            arguments: next_arguments,
            data: None,
            location: defer.location,
        };

        Ok(Transformed::Replace(Selection::InlineFragment(Arc::new(
            InlineFragment {
                type_condition: None,
                directives: vec![next_defer],
                selections: vec![Selection::FragmentSpread(Arc::new(FragmentSpread {
                    directives: remove_directive(&spread.directives, defer.name.item),
                    ..spread.clone()
                }))],
                spread_location: Location::generated(),
            },
        ))))
    }

    fn transform_stream(
        &mut self,
        linked_field: &LinkedField,
        stream: &Directive,
        defer_stream_interface: &DeferStreamInterface,
    ) -> Result<Transformed<Selection>, Diagnostic> {
        let schema_field = self.program.schema.field(linked_field.definition.item);
        if !schema_field.type_.is_list() {
            return Err(Diagnostic::error(
                ValidationMessage::StreamFieldIsNotAList {
                    field_name: schema_field.name.item,
                },
                stream.name.location,
            ));
        }

        let StreamDirective {
            if_arg,
            label_arg,
            initial_count_arg,
            use_customized_batch_arg,
        } = StreamDirective::from(stream, defer_stream_interface);

        let transformed_linked_field = self.default_transform_linked_field(linked_field);
        let get_next_selection = |directives| match transformed_linked_field {
            Transformed::Replace(mut selection) => {
                selection.set_directives(directives);
                Transformed::Replace(selection)
            }
            Transformed::Keep => {
                Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
                    directives,
                    ..linked_field.clone()
                })))
            }
            Transformed::Delete => Transformed::Delete,
        };
        if is_literal_false_arg(if_arg) {
            return Ok(get_next_selection(remove_directive(
                &linked_field.directives,
                stream.name.item,
            )));
        }

        if initial_count_arg.is_none() {
            return Err(Diagnostic::error(
                ValidationMessage::StreamInitialCountRequired,
                stream.name.location,
            ));
        }

        let label_value = get_literal_string_argument(stream, label_arg)?;
        let label = label_value.unwrap_or_else(|| {
            get_applied_fragment_name(
                FragmentDefinitionName(linked_field.alias_or_name(&self.program.schema)),
                &linked_field.arguments,
            )
            .0
        });
        let transformed_label = transform_label(
            self.current_document_name
                .expect("We expect the parent name to be defined here."),
            defer_stream_interface.stream_name,
            label,
        );
        self.record_label(transformed_label, stream, defer_stream_interface);
        let next_label_value = Value::Constant(ConstantValue::String(transformed_label));
        let next_label_arg = Argument {
            name: WithLocation {
                item: defer_stream_interface.label_arg,
                location: label_arg.map_or(stream.name.location, |arg| arg.name.location),
            },
            value: WithLocation {
                item: next_label_value,
                location: label_arg.map_or(stream.name.location, |arg| arg.value.location),
            },
        };

        let mut next_arguments = Vec::with_capacity(4);
        next_arguments.push(next_label_arg);
        if let Some(if_arg) = if_arg {
            next_arguments.push(if_arg.clone());
        }
        if let Some(initial_count_arg) = initial_count_arg {
            next_arguments.push(initial_count_arg.clone());
        }
        if let Some(use_customized_batch_arg) = use_customized_batch_arg {
            next_arguments.push(use_customized_batch_arg.clone());
        }

        let next_stream = Directive {
            name: stream.name,
            arguments: next_arguments,
            data: None,
            location: stream.location,
        };

        Ok(get_next_selection(replace_directive(
            &linked_field.directives,
            next_stream,
        )))
    }
}

impl Transformer<'_> for DeferStreamTransform<'_> {
    const NAME: &'static str = "DeferStreamTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.set_current_document_name(operation.name.item.0);
        self.default_transform_operation(operation)
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        self.set_current_document_name(fragment.name.item.0);
        self.default_transform_fragment(fragment)
    }

    /// Validates @defer is not allowed on inline fragments.
    fn transform_inline_fragment(
        &mut self,
        inline_fragment: &InlineFragment,
    ) -> Transformed<Selection> {
        let defer_directive = inline_fragment
            .directives
            .named(self.defer_stream_interface.defer_name);
        if let Some(directive) = defer_directive {
            // Special case for @defer generated by transform_connection
            if let Some(label) = directive
                .arguments
                .named(self.defer_stream_interface.label_arg)
                && let Some(label) = label.value.item.get_string_literal()
                && label.lookup().contains("$defer$")
            {
                return self.default_transform_inline_fragment(inline_fragment);
            }
            self.errors.push(Diagnostic::error(
                ValidationMessage::InvalidDeferOnInlineFragment,
                directive.location,
            ));
        }

        self.default_transform_inline_fragment(inline_fragment)
    }

    /// Transform of fragment spread with @defer is delegated to `transform_defer`.
    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        let defer_directive = spread
            .directives
            .named(self.defer_stream_interface.defer_name);
        if let Some(defer) = defer_directive {
            match self.transform_defer(spread, defer, self.defer_stream_interface) {
                Ok(transformed) => transformed,
                Err(err) => {
                    self.errors.push(err);
                    self.default_transform_fragment_spread(spread)
                }
            }
        } else {
            self.default_transform_fragment_spread(spread)
        }
    }

    /// Validates @stream is not allowed on scalar fields.
    fn transform_scalar_field(&mut self, scalar_field: &ScalarField) -> Transformed<Selection> {
        let stream_directive = &scalar_field
            .directives
            .named(self.defer_stream_interface.stream_name);
        if let Some(directive) = stream_directive {
            self.errors.push(Diagnostic::error(
                ValidationMessage::InvalidStreamOnScalarField {
                    field_name: scalar_field.alias_or_name(&self.program.schema),
                },
                directive.location,
            ));
        }
        self.default_transform_scalar_field(scalar_field)
    }

    /// Transform of linked field with @stream is delegated to `transform_stream`.
    fn transform_linked_field(&mut self, linked_field: &LinkedField) -> Transformed<Selection> {
        let stream_directive = linked_field
            .directives
            .named(self.defer_stream_interface.stream_name);
        if let Some(stream) = stream_directive {
            match self.transform_stream(linked_field, stream, self.defer_stream_interface) {
                Ok(transformed) => transformed,
                Err(err) => {
                    self.errors.push(err);
                    self.default_transform_linked_field(linked_field)
                }
            }
        } else {
            self.default_transform_linked_field(linked_field)
        }
    }
}

fn is_literal_false_arg(arg: Option<&Argument>) -> bool {
    if let Some(arg) = arg {
        matches!(
            arg.value.item,
            Value::Constant(ConstantValue::Boolean(false))
        )
    } else {
        false
    }
}

fn transform_label(
    parent_name: StringKey,
    directive_name: DirectiveName,
    label: StringKey,
) -> StringKey {
    format!("{parent_name}${directive_name}${label}").intern()
}

fn get_literal_string_argument(
    directive: &Directive,
    argument: Option<&Argument>,
) -> Result<Option<StringKey>, Diagnostic> {
    if let Some(arg) = argument {
        if let Some(val) = arg.value.item.get_string_literal() {
            Ok(Some(val))
        } else {
            Err(Diagnostic::error(
                ValidationMessage::LiteralStringArgumentExpectedForDirective {
                    arg_name: arg.name.item,
                    directive_name: directive.name.item,
                },
                directive.location,
            ))
        }
    } else {
        Ok(None)
    }
}

#[derive(Debug, Error, serde::Serialize)]
#[serde(tag = "type")]
enum ValidationMessage {
    #[error(
        "Invalid use of @{directive_name}, the provided label is not unique. Specify a unique 'label' as a literal string."
    )]
    LabelNotUniqueForDeferStream { directive_name: DirectiveName },

    #[error("Field '{field_name}' is not of list type, therefore cannot use @stream directive.")]
    StreamFieldIsNotAList { field_name: StringKey },

    #[error("Invalid use of @stream, the 'initial_count' argument is required.")]
    StreamInitialCountRequired,

    #[error(
        "Invalid use of @defer on an inline fragment. Relay only supports @defer on fragment spreads."
    )]
    InvalidDeferOnInlineFragment,

    #[error("Invalid use of @stream on scalar field '{field_name}'")]
    InvalidStreamOnScalarField { field_name: StringKey },

    #[error(
        "Expected the '{arg_name}' value to @{directive_name} to be a string literal if provided."
    )]
    LiteralStringArgumentExpectedForDirective {
        arg_name: ArgumentName,
        directive_name: DirectiveName,
    },
}
