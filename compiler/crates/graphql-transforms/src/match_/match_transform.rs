/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::match_::MATCH_CONSTANTS;
use common::{Location, WithLocation};
use fnv::FnvHashSet;
use graphql_ir::{
    Argument, ConstantValue, FragmentDefinition, InlineFragment, LinkedField, OperationDefinition,
    Program, ScalarField, Selection, Transformed, Transformer, ValidationError, ValidationMessage,
    ValidationResult, Value,
};
use interner::{Intern, StringKey};
use schema::{ScalarID, Type, TypeReference};
use std::sync::Arc;

/// Transform and validate @match and @module
pub fn match_<'s>(program: &Program<'s>) -> ValidationResult<Program<'s>> {
    let mut transformer = MatchTransform::new(program);
    let next_program = transformer.transform_program(program);
    if transformer.errors.is_empty() {
        Ok(next_program.replace_or_else(|| program.clone()))
    } else {
        Err(transformer.errors)
    }
}

pub struct MatchTransform<'s> {
    program: &'s Program<'s>,
    parent_type: Type,
    document_name: StringKey,
    module_key: Option<StringKey>,
    errors: Vec<ValidationError>,
}

impl<'s> MatchTransform<'s> {
    fn new(program: &'s Program<'s>) -> Self {
        Self {
            program,
            // Placeholders to make the types non-optional,
            parent_type: Type::Scalar(ScalarID(0)),
            document_name: "".intern(),
            module_key: None,
            errors: Vec::new(),
        }
    }

    fn push_fragment_spread_with_module_selection_err(
        &mut self,
        selection_location: Location,
        match_location: Location,
    ) {
        self.errors.push(ValidationError::new(
            ValidationMessage::InvalidMatchNotAllSelectionsFragmentSpreadWithModule,
            vec![selection_location, match_location],
        ))
    }
}

impl<'s> Transformer for MatchTransform<'s> {
    const NAME: &'static str = "MatchTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        self.parent_type = fragment.type_condition;
        self.document_name = fragment.name.item;
        self.default_transform_fragment(fragment)
    }

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.parent_type = operation.type_;
        self.document_name = operation.name.item;
        self.default_transform_operation(operation)
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        if let Some(type_) = fragment.type_condition {
            self.parent_type = type_;
        }
        self.default_transform_inline_fragment(fragment)
    }

    // Validate `js` field
    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        let field_definition = self.program.schema().field(field.definition.item);
        if field_definition.name == MATCH_CONSTANTS.js_field_name {
            match self
                .program
                .schema()
                .get_type(MATCH_CONSTANTS.js_field_type)
            {
                None => self.errors.push(ValidationError::new(
                    ValidationMessage::MissingServerSchemaDefinition {
                        name: MATCH_CONSTANTS.js_field_name,
                    },
                    vec![field.definition.location],
                )),
                Some(js_module_type) => {
                    if matches!(js_module_type, Type::Scalar(_))
                        && field_definition.type_.inner() == js_module_type
                    {
                        self.errors.push(ValidationError::new(
                            ValidationMessage::InvalidDirectUseOfJSField {
                                field_name: MATCH_CONSTANTS.js_field_name,
                            },
                            vec![field.definition.location],
                        ));
                    }
                }
            }
        }
        Transformed::Keep
    }

    // Validate and transform `@match`
    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let field_definition = self.program.schema().field(field.definition.item);
        let match_directive = field
            .directives
            .iter()
            .find(|directive| directive.name.item == MATCH_CONSTANTS.match_directive_name);

        // Only process fields with @match
        if let Some(match_directive) = match_directive {
            // Validate and keep track of the module key
            let key_arg = match_directive
                .arguments
                .iter()
                .find(|arg| arg.name.item == MATCH_CONSTANTS.key_arg);
            if let Some(arg) = key_arg {
                if let Value::Constant(ConstantValue::String(str)) = arg.value.item {
                    self.module_key = Some(str);
                    if !str.lookup().starts_with(self.document_name.lookup()) {
                        self.errors.push(ValidationError::new(
                            ValidationMessage::InvalidMatchKeyArgument {
                                document_name: self.document_name,
                            },
                            vec![arg.name.location],
                        ));
                        return Transformed::Keep;
                    }
                } else {
                    self.module_key = None;
                }
            }

            // The linked field should be an abstract type
            if !field_definition.type_.inner().is_abstract_type() {
                self.errors.push(ValidationError::new(
                    ValidationMessage::InvalidMatchNotOnUnionOrInterface {
                        field_name: field_definition.name,
                    },
                    vec![field.definition.location],
                ));
                return Transformed::Keep;
            }

            // The linked field definition should have: 'supported: [String]'
            let has_supported_string = field_definition.arguments.iter().any(|argument| {
                if argument.name == MATCH_CONSTANTS.supported_arg {
                    if let TypeReference::List(of) = argument.type_.nullable_type() {
                        if let TypeReference::Named(of) = of.nullable_type() {
                            return self.program.schema().is_string(*of);
                        }
                    }
                }
                false
            });
            if !has_supported_string {
                self.errors.push(ValidationError::new(
                    ValidationMessage::InvalidMatchNotOnNonNullListString {
                        field_name: field_definition.name,
                    },
                    vec![field.definition.location],
                ));
                return Transformed::Keep;
            }

            // The supported arg shouldn't be defined by the user
            let supported_arg = field
                .arguments
                .iter()
                .find(|argument| argument.name.item == MATCH_CONSTANTS.supported_arg);
            if let Some(supported_arg) = supported_arg {
                self.errors.push(ValidationError::new(
                    ValidationMessage::InvalidMatchNoUserSuppliedSupportedArg {
                        supported_arg: MATCH_CONSTANTS.supported_arg,
                    },
                    vec![supported_arg.name.location],
                ));
                return Transformed::Keep;
            }

            // Track fragment spread types that has @module
            // Validate that there are only `__typename`, and `...spread @module` selections
            let mut seen_types = FnvHashSet::default();
            for selection in &field.selections {
                match selection {
                    Selection::FragmentSpread(field) => {
                        let has_directive_with_module = field.directives.iter().any(|directive| {
                            directive.name.item == MATCH_CONSTANTS.module_directive_name
                        });
                        if has_directive_with_module {
                            let fragment = self.program.fragment(field.fragment.item).unwrap();
                            seen_types.insert(fragment.type_condition);
                        } else {
                            self.push_fragment_spread_with_module_selection_err(
                                field.fragment.location,
                                match_directive.name.location,
                            );
                        }
                    }
                    Selection::ScalarField(field) => {
                        if field.definition.item != self.program.schema().typename_field() {
                            self.push_fragment_spread_with_module_selection_err(
                                field.definition.location,
                                match_directive.name.location,
                            );
                        }
                    }
                    Selection::LinkedField(field) => self
                        .push_fragment_spread_with_module_selection_err(
                            field.definition.location,
                            match_directive.name.location,
                        ),
                    // TODO: no location on InlineFragment and Condition yet
                    _ => self.push_fragment_spread_with_module_selection_err(
                        field.definition.location,
                        match_directive.name.location,
                    ),
                }
            }
            if seen_types.is_empty() {
                self.errors.push(ValidationError::new(
                    ValidationMessage::InvalidMatchNoModuleSelection,
                    vec![match_directive.name.location],
                ));
                return Transformed::Keep;
            }
            let mut next_arguments = field.arguments.clone();
            next_arguments.push(Argument {
                name: WithLocation::new(field.definition.location, MATCH_CONSTANTS.supported_arg),
                value: WithLocation::new(
                    field.definition.location,
                    Value::List(
                        seen_types
                            .drain()
                            .map(|type_| {
                                Value::Constant(ConstantValue::String(
                                    self.program.schema().get_type_name(type_),
                                ))
                            })
                            .collect(),
                    ),
                ),
            });
            let mut next_directives = Vec::with_capacity(field.directives.len() - 1);
            for directive in &field.directives {
                if directive.name.item != MATCH_CONSTANTS.match_directive_name {
                    next_directives.push(directive.clone());
                }
            }
            let next_selections = self
                .transform_selections(&field.selections)
                .replace_or_else(|| field.selections.clone());
            Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
                alias: field.alias,
                definition: field.definition,
                arguments: next_arguments,
                directives: next_directives,
                selections: next_selections,
            })))
        } else {
            self.parent_type = field_definition.type_.inner();
            self.default_transform_linked_field(field)
        }
    }

    // TODO: validate and transform `@module` into a custom directive for codegen
}
