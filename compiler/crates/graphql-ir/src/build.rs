/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::errors::{ValidationError, ValidationMessage, ValidationResult};
use crate::ir::*;
use crate::signatures::{build_signatures, FragmentSignatures};
use common::{Location, Span, WithLocation};
use errors::{try2, try3, try_map};
use fnv::{FnvHashMap, FnvHashSet};
use graphql_syntax::OperationKind;
use interner::Intern;
use interner::StringKey;
use schema::{
    ArgumentDefinitions, DirectiveLocation, Enum, FieldID, InputObject, Scalar, Schema, Type,
    TypeReference,
};

/// Converts a self-contained corpus of definitions into typed IR, or returns
/// a list of errors if the corpus is invalid.
pub fn build_ir(
    schema: &Schema,
    definitions: &[graphql_syntax::ExecutableDefinition],
) -> ValidationResult<Vec<ExecutableDefinition>> {
    let signatures = build_signatures(schema, &definitions)?;
    try_map(definitions, |definition| {
        let mut builder = Builder::new(schema, &signatures, definition.location());
        builder.build_definition(definition)
    })
}

pub fn build_type_annotation(
    schema: &Schema,
    annotation: &graphql_syntax::TypeAnnotation,
    location: Location,
) -> ValidationResult<TypeReference> {
    let signatures = Default::default();
    let mut builder = Builder::new(schema, &signatures, location);
    builder.build_type_annotation(annotation)
}

pub fn build_constant_value(
    schema: &Schema,
    value: &graphql_syntax::ConstantValue,
    type_: &TypeReference,
    location: Location,
    validation: ValidationLevel,
) -> ValidationResult<ConstantValue> {
    let signatures = Default::default();
    let mut builder = Builder::new(schema, &signatures, location);
    builder.build_constant_value(value, type_, validation)
}

// Helper Types

type VariableDefinitions = FnvHashMap<StringKey, VariableDefinition>;
type UsedVariables = FnvHashMap<StringKey, VariableUsage>;

#[derive(Debug)]
struct VariableUsage {
    span: Span,
    type_: TypeReference,
}

struct Builder<'schema, 'signatures> {
    schema: &'schema Schema,
    signatures: &'signatures FragmentSignatures,
    location: Location,
    defined_variables: VariableDefinitions,
    used_variabales: UsedVariables,
}

impl<'schema, 'signatures> Builder<'schema, 'signatures> {
    pub fn new(
        schema: &'schema Schema,
        signatures: &'signatures FragmentSignatures,
        location: Location,
    ) -> Self {
        Self {
            schema,
            signatures,
            location,
            defined_variables: Default::default(),
            used_variabales: Default::default(),
        }
    }

    pub fn build_definition(
        &mut self,
        definition: &graphql_syntax::ExecutableDefinition,
    ) -> ValidationResult<ExecutableDefinition> {
        match definition {
            graphql_syntax::ExecutableDefinition::Fragment(node) => {
                Ok(ExecutableDefinition::Fragment(self.build_fragment(node)?))
            }
            graphql_syntax::ExecutableDefinition::Operation(node) => {
                Ok(ExecutableDefinition::Operation(self.build_operation(node)?))
            }
        }
    }

    fn build_fragment(
        &mut self,
        fragment: &graphql_syntax::FragmentDefinition,
    ) -> ValidationResult<FragmentDefinition> {
        let signature = self
            .signatures
            .get(&fragment.name.value)
            .expect("Expected signature to be created");
        let fragment_type = TypeReference::Named(signature.type_condition);
        let non_arguments_directives: Vec<_> = fragment
            .directives
            .iter()
            .filter(|x| x.name.value.lookup() != "argumentDefinitions")
            .collect();

        self.defined_variables = signature
            .variable_definitions
            .iter()
            .map(|x| (x.name.item, x.clone()))
            .collect();

        let directives = self.build_directives(
            non_arguments_directives,
            DirectiveLocation::FragmentDefinition,
        );
        let selections = self.build_selections(&fragment.selections.items, &fragment_type);
        let (directives, selections) = try2(directives, selections)?;
        let used_global_variables = self
            .used_variabales
            .iter()
            .map(|(name, usage)| VariableDefinition {
                name: WithLocation::new(self.location.with_span(usage.span), *name),
                type_: usage.type_.clone(),
                directives: Default::default(),
                default_value: None,
            })
            .collect();
        Ok(FragmentDefinition {
            name: signature.name,
            type_condition: signature.type_condition,
            variable_definitions: signature.variable_definitions.clone(),
            used_global_variables,
            directives,
            selections,
        })
    }

    fn build_operation(
        &mut self,
        operation: &graphql_syntax::OperationDefinition,
    ) -> ValidationResult<OperationDefinition> {
        let name = match &operation.name {
            Some(name) => name,
            None => {
                return Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::ExpectedOperationName(),
                        vec![operation.location],
                    ))
                    .into())
            }
        };
        let kind = operation
            .operation
            .as_ref()
            .map(|x| x.1)
            .unwrap_or_else(|| OperationKind::Query);
        let operation_type = match kind {
            OperationKind::Mutation => self.schema.mutation_type(),
            OperationKind::Query => self.schema.query_type(),
            OperationKind::Subscription => self.schema.subscription_type(),
        };
        let operation_type = match operation_type {
            Some(operation_type) => operation_type,
            None => {
                return Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::UnsupportedOperation(kind),
                        vec![operation.location],
                    ))
                    .into())
            }
        };

        let variable_definitions = match operation.variable_definitions {
            Some(ref variable_definitions) => {
                self.build_variable_definitions(&variable_definitions.items)?
            }
            None => Default::default(),
        };
        self.defined_variables = variable_definitions
            .iter()
            .map(|x| (x.name.item, x.clone()))
            .collect();

        let directives = self.build_directives(
            &operation.directives,
            match kind {
                OperationKind::Query => DirectiveLocation::Query,
                OperationKind::Mutation => DirectiveLocation::Mutation,
                OperationKind::Subscription => DirectiveLocation::Subscription,
            },
        );
        let operation_type_reference = TypeReference::Named(operation_type);
        let selections =
            self.build_selections(&operation.selections.items, &operation_type_reference);
        let (directives, selections) = try2(directives, selections)?;
        if !self.used_variabales.is_empty() {
            Err(self
                .record_error(ValidationError::new(
                    ValidationMessage::ExpectedVariablesToBeDefined(),
                    self.used_variabales
                        .values()
                        .map(|x| self.location.with_span(x.span))
                        .collect(),
                ))
                .into())
        } else {
            Ok(OperationDefinition {
                kind,
                name: name.name_with_location(self.location.file()),
                type_: operation_type,
                variable_definitions,
                directives,
                selections,
            })
        }
    }

    fn build_variable_definitions(
        &mut self,
        definitions: &[graphql_syntax::VariableDefinition],
    ) -> ValidationResult<Vec<VariableDefinition>> {
        try_map(definitions, |definition| {
            self.build_variable_definition(definition)
        })
    }

    fn build_variable_definition(
        &mut self,
        definition: &graphql_syntax::VariableDefinition,
    ) -> ValidationResult<VariableDefinition> {
        let type_ = self.build_type_annotation(&definition.type_)?;
        if !type_.inner().is_input_type() {
            return Err(self
                .record_error(ValidationError::new(
                    ValidationMessage::ExpectedVariablesToHaveInputType(
                        self.schema.get_type_name(type_.inner()),
                    ),
                    vec![self.location.with_span(definition.span)],
                ))
                .into());
        }
        let default_value = match &definition.default_value {
            Some(default_value) => Some(self.build_constant_value(
                &default_value.value,
                &type_,
                ValidationLevel::Strict,
            )?),
            None => None,
        };
        let directives = self.build_directives(
            &definition.directives,
            DirectiveLocation::VariableDefinition,
        )?;
        Ok(VariableDefinition {
            name: definition.name.name_with_location(self.location.file()),
            type_,
            default_value,
            directives,
        })
    }

    fn build_type_annotation(
        &mut self,
        annotation: &graphql_syntax::TypeAnnotation,
    ) -> ValidationResult<TypeReference> {
        self.build_type_annotation_inner(annotation)
    }

    fn build_type_annotation_inner(
        &mut self,
        annotation: &graphql_syntax::TypeAnnotation,
    ) -> ValidationResult<TypeReference> {
        match annotation {
            graphql_syntax::TypeAnnotation::Named(name) => match self.schema.get_type(name.value) {
                Some(type_) => Ok(TypeReference::Named(type_)),
                None => Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::UnknownType(name.value),
                        vec![self.location.with_span(name.span)],
                    ))
                    .into()),
            },
            graphql_syntax::TypeAnnotation::NonNull(non_null) => {
                let inner = self.build_type_annotation_inner(&non_null.type_)?;
                Ok(TypeReference::NonNull(Box::new(inner)))
            }
            graphql_syntax::TypeAnnotation::List(list) => {
                // TODO: Nested lists is allowed to support existing query variables definitions
                let inner = self.build_type_annotation_inner(&list.type_)?;
                Ok(TypeReference::List(Box::new(inner)))
            }
        }
    }

    fn build_selections(
        &mut self,
        selections: &[graphql_syntax::Selection],
        parent_type: &TypeReference,
    ) -> ValidationResult<Vec<Selection>> {
        try_map(selections, |selection| {
            // Here we've built our normal selections (fragments, linked fields, etc)
            let mut next_selection = self.build_selection(selection, parent_type)?;

            // If there is no directives on selection return early.
            if next_selection.directives().is_empty() {
                return Ok(next_selection);
            }

            // Now, let's look into selection directives, and split them into two
            // categories: conditions and other directives
            let (conditions, directives) =
                split_conditions_and_directivs(&next_selection.directives());

            // If conditions are empty -> return the original selection
            if conditions.is_empty() {
                return Ok(next_selection);
            }

            // If not, then updated directives
            next_selection.set_directives(directives);

            // And wrap the original selection with `Selection::Condition`
            Ok(wrap_selection_with_conditions(&next_selection, &conditions))
        })
    }

    fn build_selection(
        &mut self,
        selection: &graphql_syntax::Selection,
        parent_type: &TypeReference,
    ) -> ValidationResult<Selection> {
        match selection {
            graphql_syntax::Selection::FragmentSpread(selection) => Ok(Selection::FragmentSpread(
                From::from(self.build_fragment_spread(selection, parent_type)?),
            )),
            graphql_syntax::Selection::InlineFragment(selection) => Ok(Selection::InlineFragment(
                From::from(self.build_inline_fragment(selection, parent_type)?),
            )),
            graphql_syntax::Selection::LinkedField(selection) => Ok(Selection::LinkedField(
                From::from(self.build_linked_field(selection, parent_type)?),
            )),
            graphql_syntax::Selection::ScalarField(selection) => Ok(Selection::ScalarField(
                From::from(self.build_scalar_field(selection, parent_type)?),
            )),
        }
    }

    fn build_fragment_spread(
        &mut self,
        spread: &graphql_syntax::FragmentSpread,
        parent_type: &TypeReference,
    ) -> ValidationResult<FragmentSpread> {
        // Exit early if the fragment does not exist
        let signature = match self.signatures.get(&spread.name.value) {
            Some(fragment) => fragment,
            None => {
                return Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::UndefinedFragment(spread.name.value),
                        vec![self.location.with_span(spread.span)],
                    ))
                    .into())
            }
        };

        if !self
            .schema
            .are_overlapping_types(parent_type.inner(), signature.type_condition)
        {
            // no possible overlap
            return Err(self
                .record_error(ValidationError::new(
                    ValidationMessage::InvalidFragmentSpreadType {
                        fragment_name: spread.name.value,
                        parent_type: self
                            .schema
                            .get_type_name(parent_type.inner())
                            .lookup()
                            .to_owned(),
                        type_condition: self
                            .schema
                            .get_type_name(signature.type_condition)
                            .lookup()
                            .to_owned(),
                    },
                    vec![self.location.with_span(spread.span)],
                ))
                .into());
        }

        let (mut argument_directives, other_directives) = spread
            .directives
            .iter()
            .partition::<Vec<_>, _>(|x| x.name.value.lookup() == "arguments");

        // TODO: fully handle uncheckedArguments_DEPRECATED
        let (unchecked_argument_directives, other_directives) = other_directives
            .into_iter()
            .partition::<Vec<_>, _>(|x| x.name.value.lookup() == "uncheckedArguments_DEPRECATED");

        if argument_directives.len() + unchecked_argument_directives.len() > 1 {
            return Err(self
                .record_error(ValidationError::new(
                    ValidationMessage::ExpectedOneArgumentsDirective(),
                    argument_directives
                        .iter()
                        .chain(unchecked_argument_directives.iter())
                        .map(|x| self.location.with_span(x.span))
                        .collect(),
                ))
                .into());
        }

        let argument_directive = argument_directives.pop();

        let arguments: ValidationResult<Vec<Argument>> = match argument_directive {
            Some(graphql_syntax::Directive {
                arguments: Some(arg_list),
                ..
            }) => {
                arg_list
                    .items
                    .iter()
                    .map(|arg| {
                        let argument_definition = signature
                            .variable_definitions
                            .iter()
                            .find(|x| x.name.item == arg.name.value);
                        match argument_definition {
                            Some(argument_definition) => {
                                // TODO: We didn't use to enforce types of @args/@argDefs properly, which resulted
                                // in a lot of code that is technically valid but doesn't type-check. Specifically,
                                // many fragment @argDefs are typed as non-null but used in places that accept a
                                // nullable value. Similarly, the corresponding @args pass nullable values. This
                                // works since ultimately a nullable T flows into a nullable T, but isn't
                                // technically correct. There are also @argDefs are typed with different types,
                                // but the persist query allowed them as the types are the same underlyingly.
                                // NOTE: We keep the same behavior as JS compiler for now, where we don't validate
                                // types of variables passed to @args at all
                                Ok(self.build_argument(
                                    arg,
                                    &argument_definition.type_,
                                    ValidationLevel::Loose,
                                )?)
                            }
                            None => Err(self
                                .record_error(ValidationError::new(
                                    ValidationMessage::UnknownArgument(arg.name.value),
                                    vec![self.location.with_span(arg.span)],
                                ))
                                .into()),
                        }
                    })
                    .collect()
            }
            _ => Ok(Default::default()),
        };

        let directives = self.build_directives(other_directives, DirectiveLocation::FragmentSpread);
        let (arguments, directives) = try2(arguments, directives)?;
        Ok(FragmentSpread {
            fragment: spread.name.name_with_location(self.location.file()),
            arguments,
            directives,
        })
    }

    fn build_inline_fragment(
        &mut self,
        fragment: &graphql_syntax::InlineFragment,
        parent_type: &TypeReference,
    ) -> ValidationResult<InlineFragment> {
        // Error early if the type condition is invalid, since we can't correctly build
        // its selections w an invalid parent type
        let type_condition = match &fragment.type_condition {
            Some(type_condition_node) => {
                let type_name = type_condition_node.type_.value;
                match self.schema.get_type(type_name) {
                    Some(type_condition) => match type_condition {
                        Type::Interface(..) | Type::Object(..) | Type::Union(..) => {
                            Some(type_condition)
                        }
                        _ => {
                            return Err(self
                                .record_error(ValidationError::new(
                                    ValidationMessage::ExpectedCompositeType(type_condition),
                                    vec![self.location.with_span(type_condition_node.type_.span)],
                                ))
                                .into())
                        }
                    },
                    None => {
                        return Err(self
                            .record_error(ValidationError::new(
                                ValidationMessage::UnknownType(type_name),
                                vec![self.location.with_span(type_condition_node.type_.span)],
                            ))
                            .into())
                    }
                }
            }
            None => None,
        };

        if let Some(type_condition) = type_condition {
            if !(self
                .schema
                .are_overlapping_types(parent_type.inner(), type_condition))
            {
                // no possible overlap
                return Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::InvalidInlineFragmentTypeCondition {
                            parent_type: self
                                .schema
                                .get_type_name(parent_type.inner())
                                .lookup()
                                .to_owned(),
                            type_condition: self
                                .schema
                                .get_type_name(type_condition)
                                .lookup()
                                .to_owned(),
                        },
                        vec![self.location.with_span(fragment.span)],
                    ))
                    .into());
            }
        }

        let type_condition_reference = type_condition
            .map(TypeReference::Named)
            .unwrap_or_else(|| parent_type.clone());
        let selections =
            self.build_selections(&fragment.selections.items, &type_condition_reference);
        let directives =
            self.build_directives(&fragment.directives, DirectiveLocation::InlineFragment);
        let (directives, selections) = try2(directives, selections)?;
        Ok(InlineFragment {
            type_condition,
            directives,
            selections,
        })
    }

    fn build_linked_field(
        &mut self,
        field: &graphql_syntax::LinkedField,
        parent_type: &TypeReference,
    ) -> ValidationResult<LinkedField> {
        let span = field.name.span;
        let field_id = match self.lookup_field(
            parent_type.inner(),
            field.name.value,
            &field.arguments,
            &field.directives,
        ) {
            Some(field_id) => field_id,
            None => {
                return Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::UnknownField {
                            type_: self.schema.get_type_name(parent_type.inner()),
                            field: field.name.value,
                        },
                        vec![self.location.with_span(span)],
                    ))
                    .into())
            }
        };
        let field_definition = self.schema.field(field_id);
        if field_definition.type_.inner().is_scalar() || field_definition.type_.inner().is_enum() {
            return Err(self
                .record_error(ValidationError::new(
                    ValidationMessage::InvalidSelectionsOnScalarField(
                        parent_type.inner(),
                        field.name.value,
                    ),
                    vec![self.location.with_span(span)],
                ))
                .into());
        }
        let alias = self.build_alias(&field.alias);
        let arguments = self.build_arguments(&field.arguments, &field_definition.arguments);
        let selections = self.build_selections(&field.selections.items, &field_definition.type_);
        let directives = self.build_directives(&field.directives, DirectiveLocation::Field);
        let (arguments, selections, directives) = try3(arguments, selections, directives)?;
        Ok(LinkedField {
            alias,
            definition: WithLocation::from_span(self.location.file(), span, field_id),
            arguments,
            directives,
            selections,
        })
    }

    fn build_scalar_field(
        &mut self,
        field: &graphql_syntax::ScalarField,
        parent_type: &TypeReference,
    ) -> ValidationResult<ScalarField> {
        let field_name = field.name.value.lookup();
        if field_name == "__typename" {
            return self.build_typename_field(field);
        } else if field_name == "__id" {
            return self.build_clientid_field(field);
        };
        let span = field.name.span;
        let field_id = match self.lookup_field(
            parent_type.inner(),
            field.name.value,
            &field.arguments,
            &field.directives,
        ) {
            Some(field_id) => field_id,
            None => {
                return Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::UnknownField {
                            type_: self.schema.get_type_name(parent_type.inner()),
                            field: field.name.value,
                        },
                        vec![self.location.with_span(span)],
                    ))
                    .into())
            }
        };
        let field_definition = self.schema.field(field_id);
        if !field_definition.type_.inner().is_scalar() && !field_definition.type_.inner().is_enum()
        {
            return Err(self
                .record_error(ValidationError::new(
                    ValidationMessage::ExpectedSelectionsOnObjectField(
                        parent_type.inner(),
                        field.name.value,
                    ),
                    vec![self.location.with_span(span)],
                ))
                .into());
        }
        let alias = self.build_alias(&field.alias);
        let arguments = self.build_arguments(&field.arguments, &field_definition.arguments);
        let directives = self.build_directives(&field.directives, DirectiveLocation::Field);
        let (arguments, directives) = try2(arguments, directives)?;

        Ok(ScalarField {
            alias,
            definition: WithLocation::from_span(self.location.file(), span, field_id),
            arguments,
            directives,
        })
    }

    fn build_clientid_field(
        &mut self,
        field: &graphql_syntax::ScalarField,
    ) -> ValidationResult<ScalarField> {
        let field_id = self.schema.clientid_field();
        let alias = self.build_alias(&field.alias);
        if let Some(arguments) = &field.arguments {
            return Err(ValidationError::new(
                ValidationMessage::InvalidArgumentsOnTypenameField(),
                vec![self.location.with_span(arguments.span)],
            )
            .into());
        }
        let directives = self.build_directives(&field.directives, DirectiveLocation::Field)?;
        Ok(ScalarField {
            alias,
            definition: WithLocation::from_span(self.location.file(), field.name.span, field_id),
            arguments: Default::default(),
            directives,
        })
    }

    fn build_typename_field(
        &mut self,
        field: &graphql_syntax::ScalarField,
    ) -> ValidationResult<ScalarField> {
        let field_id = self.schema.typename_field();
        let alias = self.build_alias(&field.alias);
        if let Some(arguments) = &field.arguments {
            return Err(ValidationError::new(
                ValidationMessage::InvalidArgumentsOnTypenameField(),
                vec![self.location.with_span(arguments.span)],
            )
            .into());
        }
        let directives = self.build_directives(&field.directives, DirectiveLocation::Field)?;
        Ok(ScalarField {
            alias,
            definition: WithLocation::from_span(self.location.file(), field.name.span, field_id),
            arguments: Default::default(),
            directives,
        })
    }

    fn build_alias(
        &mut self,
        alias: &Option<graphql_syntax::Alias>,
    ) -> Option<WithLocation<StringKey>> {
        alias
            .as_ref()
            .map(|alias| alias.alias.name_with_location(self.location.file()))
    }

    fn build_arguments(
        &mut self,
        arguments: &Option<graphql_syntax::List<graphql_syntax::Argument>>,
        argument_definitions: &ArgumentDefinitions,
    ) -> ValidationResult<Vec<Argument>> {
        match arguments {
            Some(arguments) => arguments
                .items
                .iter()
                .map(
                    |argument| match argument_definitions.get(argument.name.value) {
                        Some(argument_definition) => self.build_argument(
                            argument,
                            &argument_definition.type_,
                            ValidationLevel::Strict,
                        ),
                        None => Err(self
                            .record_error(ValidationError::new(
                                ValidationMessage::UnknownArgument(argument.name.value),
                                vec![self.location.with_span(argument.name.span)],
                            ))
                            .into()),
                    },
                )
                .collect(),
            None => Ok(vec![]),
        }
    }

    fn build_directives<'a>(
        &mut self,
        directives: impl IntoIterator<Item = &'a graphql_syntax::Directive>,
        location: DirectiveLocation,
    ) -> ValidationResult<Vec<Directive>> {
        try_map(directives, |directive| {
            self.build_directive(directive, location)
        })
    }

    fn build_directive(
        &mut self,
        directive: &graphql_syntax::Directive,
        location: DirectiveLocation,
    ) -> ValidationResult<Directive> {
        let directive_definition = match self.schema.get_directive(directive.name.value) {
            Some(directive_definition) => directive_definition,
            None => {
                return Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::UnknownDirective(directive.name.value),
                        vec![self.location.with_span(directive.name.span)],
                    ))
                    .into())
            }
        };
        if !directive_definition.locations.contains(&location) {
            return Err(ValidationError::new(
                ValidationMessage::InvalidDirectiveUsageUnsupportedLocation(directive.name.value),
                vec![self.location.with_span(directive.name.span)],
            )
            .into());
        }
        let arguments =
            self.build_arguments(&directive.arguments, &directive_definition.arguments)?;
        Ok(Directive {
            name: directive.name.name_with_location(self.location.file()),
            arguments,
        })
    }

    fn build_argument(
        &mut self,
        argument: &graphql_syntax::Argument,
        type_: &TypeReference,
        validation: ValidationLevel,
    ) -> ValidationResult<Argument> {
        let value_span = argument.value.span();
        let value = self.build_value(&argument.value, type_, validation)?;
        Ok(Argument {
            name: argument.name.name_with_location(self.location.file()),
            value: WithLocation::from_span(self.location.file(), value_span, value),
        })
    }

    fn build_variable(
        &mut self,
        variable: &graphql_syntax::VariableIdentifier,
        used_as_type: &TypeReference,
        validation: ValidationLevel,
    ) -> ValidationResult<Variable> {
        // Check current usage against definition and previous usage
        if let Some(variable_definition) = self.defined_variables.get(&variable.name) {
            // The effective type of the variable when taking into account its default value:
            // if there is a non-null default then the value's type is non-null.
            let non_null_type = variable_definition.type_.non_null();
            let effective_type = if variable_definition.has_non_null_default_value() {
                &non_null_type
            } else {
                &variable_definition.type_
            };
            // Inner types compatibility check removed for loose level
            // to keep the same behvior as the JS compiler T61653642
            if validation == ValidationLevel::Strict
                && !self.schema.is_type_subtype_of(effective_type, used_as_type)
            {
                let defined_type = self.schema.get_type_string(&variable_definition.type_);
                let used_type = self.schema.get_type_string(used_as_type);
                return Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::InvalidVariableUsage {
                            defined_type,
                            used_type,
                        },
                        vec![self.location.with_span(variable.span)],
                    ))
                    .into());
            }
        } else if let Some(prev_usage) = self.used_variabales.get(&variable.name) {
            let is_used_subtype = self
                .schema
                .is_type_subtype_of(used_as_type, &prev_usage.type_);
            if !(is_used_subtype
                || self
                    .schema
                    .is_type_subtype_of(&prev_usage.type_, used_as_type))
            {
                let prev_type = self.schema.get_type_string(&prev_usage.type_);
                let next_type = self.schema.get_type_string(used_as_type);
                let next_span = self.location.with_span(variable.span);
                let prev_span = self.location.with_span(prev_usage.span);
                return Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::IncompatibleVariableUsage {
                            prev_type,
                            next_type,
                        },
                        vec![next_span, prev_span],
                    ))
                    .into());
            }
            // If the currently used type is a subtype of the previous usage, then it could
            // be a narrower type. Update our inference to reflect the stronger requirements.
            if is_used_subtype {
                self.used_variabales.insert(
                    variable.name,
                    VariableUsage {
                        type_: used_as_type.clone(),
                        span: variable.span,
                    },
                );
            }
        } else {
            self.used_variabales.insert(
                variable.name,
                VariableUsage {
                    type_: used_as_type.clone(),
                    span: variable.span,
                },
            );
        }
        Ok(Variable {
            name: variable.name_with_location(self.location.file()),
            type_: used_as_type.clone(),
        })
    }

    fn build_value(
        &mut self,
        value: &graphql_syntax::Value,
        type_: &TypeReference,
        validation: ValidationLevel,
    ) -> ValidationResult<Value> {
        // Early return if a constant so that later matches only have to handle
        // variables
        if let graphql_syntax::Value::Constant(constant) = value {
            return Ok(Value::Constant(self.build_constant_value(
                &constant,
                type_,
                ValidationLevel::Strict,
            )?));
        }
        if let graphql_syntax::Value::Variable(variable) = value {
            return Ok(Value::Variable(
                self.build_variable(variable, type_, validation)?,
            ));
        }
        match type_.nullable_type() {
            TypeReference::List(item_type) => match value {
                graphql_syntax::Value::List(list) => {
                    let items: ValidationResult<Vec<Value>> = list
                        .items
                        .iter()
                        .map(|x| self.build_value(x, item_type, ValidationLevel::Strict))
                        .collect();
                    Ok(Value::List(items?))
                }
                _ => {
                    // A list type is expected but a scalar was received:
                    // check that it's a valid item type and pass-through
                    self.build_value(value, item_type, ValidationLevel::Strict)
                }
            },
            TypeReference::Named(named_type) => match named_type {
                Type::InputObject(id) => {
                    let type_definition = self.schema.input_object(id.clone());
                    self.build_input_object(value, type_definition)
                }
                Type::Enum(id) => {
                    let type_definition = self.schema.enum_(id.clone());
                    Err(self
                        .record_error(ValidationError::new(
                            ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                            vec![self.location.with_span(value.span())],
                        ))
                        .into())
                }
                Type::Scalar(id) => {
                    let type_definition = self.schema.scalar(id.clone());
                    Err(self
                        .record_error(ValidationError::new(
                            ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                            vec![self.location.with_span(value.span())],
                        ))
                        .into())
                }
                _ => unreachable!("input types must be list, input object, enum, or scalar"),
            },
            _ => unreachable!("nullable_type() should not return NonNull"),
        }
    }

    fn build_input_object(
        &mut self,
        value: &graphql_syntax::Value,
        type_definition: &InputObject,
    ) -> ValidationResult<Value> {
        let object = match value {
            graphql_syntax::Value::Object(object) => object,
            graphql_syntax::Value::Constant(_) => {
                unreachable!("Constants should fall into the build_constant_input_object path")
            }
            _ => {
                return Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                        vec![self.location.with_span(value.span())],
                    ))
                    .into())
            }
        };
        let mut seen_fields: FnvHashMap<StringKey, Span> = FnvHashMap::default();
        let mut required_fields: FnvHashSet<StringKey> = type_definition
            .fields
            .iter()
            .filter(|x| x.type_.is_non_null())
            .map(|x| x.name)
            .collect();

        let fields: ValidationResult<Vec<Argument>> = object
            .items
            .iter()
            .map(|x| match type_definition.fields.get(x.name.value) {
                Some(field_definition) => {
                    required_fields.remove(&x.name.value);
                    let prev_span = seen_fields.insert(x.name.value, x.name.span);
                    if let Some(prev_span) = prev_span {
                        return Err(self
                            .record_error(ValidationError::new(
                                ValidationMessage::DuplicateInputField(x.name.value),
                                vec![
                                    self.location.with_span(x.name.span),
                                    self.location.with_span(prev_span.clone()),
                                ],
                            ))
                            .into());
                    };

                    let value_span = x.value.span();
                    let value = self.build_value(
                        &x.value,
                        &field_definition.type_,
                        ValidationLevel::Strict,
                    )?;
                    Ok(Argument {
                        name: x.name.name_with_location(self.location.file()),
                        value: WithLocation::from_span(self.location.file(), value_span, value),
                    })
                }
                None => Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::UnknownField {
                            type_: type_definition.name,
                            field: x.name.value,
                        },
                        vec![self.location.with_span(x.name.span)],
                    ))
                    .into()),
            })
            .collect();
        if required_fields.is_empty() {
            Ok(Value::Object(fields?))
        } else {
            let mut missing: Vec<StringKey> = required_fields.into_iter().map(|x| x).collect();
            missing.sort_by_key(|x| x.lookup());
            Err(self
                .record_error(ValidationError::new(
                    ValidationMessage::MissingRequiredFields(missing, type_definition.name),
                    vec![self.location.with_span(object.span)],
                ))
                .into())
        }
    }

    fn build_constant_value(
        &mut self,
        value: &graphql_syntax::ConstantValue,
        type_: &TypeReference,
        enum_validation: ValidationLevel,
    ) -> ValidationResult<ConstantValue> {
        // Special case for null: if the type is nullable then just return null,
        // otherwise report an error since null is invalid. thereafter all
        // conversions can assume the input is not ConstantValue::Null.
        if let graphql_syntax::ConstantValue::Null(null) = &value {
            if type_.is_non_null() {
                return Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::ExpectedValueMatchingType(
                            self.schema.get_type_name(type_.inner()),
                        ),
                        vec![self.location.with_span(null.span)],
                    ))
                    .into());
            } else {
                return Ok(ConstantValue::Null());
            }
        }
        match type_.nullable_type() {
            TypeReference::List(item_type) => match value {
                graphql_syntax::ConstantValue::List(list) => {
                    let items: ValidationResult<Vec<ConstantValue>> = list
                        .items
                        .iter()
                        .map(|x| self.build_constant_value(x, item_type, enum_validation))
                        .collect();
                    Ok(ConstantValue::List(items?))
                }
                _ => {
                    // List Input Coercion:
                    // https://spec.graphql.org/draft/#sec-Type-System.List.Input-Coercion
                    self.build_constant_value(value, item_type, enum_validation)
                }
            },
            TypeReference::Named(named_type) => match named_type {
                Type::InputObject(id) => {
                    let type_definition = self.schema.input_object(id.clone());
                    self.build_constant_input_object(value, type_definition, enum_validation)
                }
                Type::Enum(id) => {
                    let type_definition = self.schema.enum_(id.clone());
                    self.build_constant_enum(value, type_definition, enum_validation)
                }
                Type::Scalar(id) => {
                    let type_definition = self.schema.scalar(id.clone());
                    self.build_constant_scalar(value, type_definition)
                }
                _ => unreachable!("input types must be list, input object, enum, or scalar"),
            },
            _ => unreachable!("nullable_type() should not return NonNull"),
        }
    }

    fn build_constant_input_object(
        &mut self,
        value: &graphql_syntax::ConstantValue,
        type_definition: &InputObject,
        validation: ValidationLevel,
    ) -> ValidationResult<ConstantValue> {
        let object = match value {
            graphql_syntax::ConstantValue::Object(object) => object,
            _ => {
                return Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                        vec![self.location.with_span(value.span())],
                    ))
                    .into())
            }
        };
        let mut seen_fields: FnvHashMap<StringKey, Span> = FnvHashMap::default();
        let mut required_fields: FnvHashSet<StringKey> = type_definition
            .fields
            .iter()
            .filter(|x| x.type_.is_non_null())
            .map(|x| x.name)
            .collect();

        let fields: ValidationResult<Vec<ConstantArgument>> = object
            .items
            .iter()
            .map(|x| match type_definition.fields.get(x.name.value) {
                Some(field_definition) => {
                    required_fields.remove(&x.name.value);
                    let prev_span = seen_fields.insert(x.name.value, x.name.span);
                    if let Some(prev_span) = prev_span {
                        return Err(self
                            .record_error(ValidationError::new(
                                ValidationMessage::DuplicateInputField(x.name.value),
                                vec![
                                    self.location.with_span(x.name.span),
                                    self.location.with_span(prev_span.clone()),
                                ],
                            ))
                            .into());
                    };

                    let value_span = x.value.span();
                    let value =
                        self.build_constant_value(&x.value, &field_definition.type_, validation)?;
                    Ok(ConstantArgument {
                        name: x.name.name_with_location(self.location.file()),
                        value: WithLocation::from_span(self.location.file(), value_span, value),
                    })
                }
                None => Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::UnknownField {
                            type_: type_definition.name,
                            field: x.name.value,
                        },
                        vec![self.location.with_span(x.name.span)],
                    ))
                    .into()),
            })
            .collect();
        if required_fields.is_empty() {
            Ok(ConstantValue::Object(fields?))
        } else {
            let mut missing: Vec<StringKey> = required_fields.into_iter().map(|x| x).collect();
            missing.sort_by_key(|x| x.lookup());
            Err(self
                .record_error(ValidationError::new(
                    ValidationMessage::MissingRequiredFields(missing, type_definition.name),
                    vec![self.location.with_span(object.span)],
                ))
                .into())
        }
    }

    fn build_constant_enum(
        &mut self,
        node: &graphql_syntax::ConstantValue,
        type_definition: &Enum,
        validation: ValidationLevel,
    ) -> ValidationResult<ConstantValue> {
        let value = match node {
            graphql_syntax::ConstantValue::Enum(value) => value.value,
            graphql_syntax::ConstantValue::String(value) => {
                if validation == ValidationLevel::Strict {
                    return Err(self
                        .record_error(ValidationError::new(
                            ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                            vec![self.location.with_span(node.span())],
                        ))
                        .into());
                }
                value.value
            }
            _ => {
                return Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                        vec![self.location.with_span(node.span())],
                    ))
                    .into())
            }
        };
        if type_definition.values.contains(&value)
            || (validation == ValidationLevel::Loose
                && (type_definition
                    .values
                    .contains(&value.lookup().to_uppercase().intern())
                    || type_definition
                        .values
                        .contains(&value.lookup().to_lowercase().intern())))
        {
            Ok(ConstantValue::Enum(value))
        } else {
            Err(self
                .record_error(ValidationError::new(
                    ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                    vec![self.location.with_span(node.span())],
                ))
                .into())
        }
    }

    fn build_constant_scalar(
        &mut self,
        value: &graphql_syntax::ConstantValue,
        type_definition: &Scalar,
    ) -> ValidationResult<ConstantValue> {
        match type_definition.name.lookup() {
            "ID" => match value {
                graphql_syntax::ConstantValue::Int(node) => Ok(ConstantValue::Int(node.value)),
                graphql_syntax::ConstantValue::String(node) => {
                    Ok(ConstantValue::String(node.value))
                }
                _ => Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                        vec![self.location.with_span(value.span())],
                    ))
                    .into()),
            },
            "String" => match value {
                graphql_syntax::ConstantValue::String(node) => {
                    Ok(ConstantValue::String(node.value))
                }
                _ => Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                        vec![self.location.with_span(value.span())],
                    ))
                    .into()),
            },
            "Float" => match value {
                graphql_syntax::ConstantValue::Float(node) => Ok(ConstantValue::Float(node.value)),
                graphql_syntax::ConstantValue::Int(node) => {
                    Ok(ConstantValue::Float(From::from(node.value)))
                }
                _ => Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                        vec![self.location.with_span(value.span())],
                    ))
                    .into()),
            },
            "Boolean" => match value {
                graphql_syntax::ConstantValue::Boolean(node) => {
                    Ok(ConstantValue::Boolean(node.value))
                }
                _ => Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                        vec![self.location.with_span(value.span())],
                    ))
                    .into()),
            },
            "Int" => match value {
                graphql_syntax::ConstantValue::Int(node) => Ok(ConstantValue::Int(node.value)),
                _ => Err(self
                    .record_error(ValidationError::new(
                        ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                        vec![self.location.with_span(value.span())],
                    ))
                    .into()),
            },
            _ => Err(self
                .record_error(ValidationError::new(
                    ValidationMessage::UnsupportedCustomScalarType(type_definition.name),
                    vec![self.location.with_span(value.span())],
                ))
                .into()),
        }
    }
    fn lookup_field(
        &self,
        parent_type: Type,
        field_name: StringKey,
        arguments: &Option<graphql_syntax::List<graphql_syntax::Argument>>,
        directives: &[graphql_syntax::Directive],
    ) -> Option<FieldID> {
        if let Some(field_id) = self.schema.named_field(parent_type, field_name) {
            return Some(field_id);
        };
        // Handle @fixme_fat_interface: if present and the parent type is abstract, see
        // if one of the implementors has this field and if so use that definition.
        if !directives
            .iter()
            .any(|x| x.name.value.lookup() == "fixme_fat_interface")
        {
            return None;
        };
        let possible_types = match parent_type {
            Type::Interface(id) => {
                let interface = self.schema.interface(id);
                Some(&interface.implementors)
            }
            Type::Union(id) => {
                let union = self.schema.union(id);
                Some(&union.members)
            }
            Type::Object(_) => None,
            _ => unreachable!("Parent type of a field must be an interface, union, or object"),
        };
        if let Some(possible_types) = possible_types {
            for possible_type in possible_types.iter() {
                let field = self
                    .schema
                    .named_field(Type::Object(*possible_type), field_name);
                if let Some(field_id) = field {
                    let field = self.schema.field(field_id);
                    if let Some(arguments) = arguments {
                        if arguments
                            .items
                            .iter()
                            .all(|x| field.arguments.contains(x.name.value))
                        {
                            return Some(field_id);
                        }
                    } else {
                        return Some(field_id);
                    }
                }
            }
        }
        None
    }

    fn record_error(&mut self, error: ValidationError) -> ValidationError {
        // panic!()
        error
    }
}

#[derive(Copy, Clone, Eq, PartialEq)]
pub enum ValidationLevel {
    Strict,
    Loose,
}

fn split_conditions_and_directivs(directives: &[Directive]) -> (Vec<Directive>, Vec<Directive>) {
    directives.iter().cloned().partition(|directive| {
        directive.name.item.lookup() == "skip" || directive.name.item.lookup() == "include"
    })
}

fn wrap_selection_with_conditions(selection: &Selection, conditions: &[Directive]) -> Selection {
    let mut result: Selection = selection.clone();
    for condition in conditions {
        result = wrap_selection_with_condition(&result, &condition)
    }
    result
}

fn wrap_selection_with_condition(selection: &Selection, condition: &Directive) -> Selection {
    Selection::Condition(From::from(Condition {
        value: match &condition.arguments[0].value.item {
            Value::Constant(ConstantValue::Boolean(value)) => ConditionValue::Constant(*value),
            Value::Variable(variable) => ConditionValue::Variable(variable.clone()),
            _ => unreachable!("Unexpected variable type for the condition directive"),
        },
        passing_value: condition.name.item.lookup() == "include",
        selections: vec![selection.clone()],
    }))
}
