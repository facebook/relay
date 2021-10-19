/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::constants::ARGUMENT_DEFINITION;
use crate::errors::ValidationMessage;
use crate::ir::*;
use crate::signatures::{build_signatures, FragmentSignature, FragmentSignatures};
use common::{Diagnostic, DiagnosticsResult, Location, NamedItem, Span, WithLocation};
use core::cmp::Ordering;
use errors::{par_try_map, try2, try3, try_map};
use fnv::{FnvBuildHasher, FnvHashMap, FnvHashSet};
use graphql_syntax::{DirectiveLocation, List, OperationKind};
use indexmap::IndexMap;
use interner::Intern;
use interner::StringKey;
use lazy_static::lazy_static;
use schema::{
    ArgumentDefinitions, Enum, FieldID, InputObject, SDLSchema, Scalar, Schema, Type, TypeReference,
};

lazy_static! {
    static ref TYPENAME_FIELD_NAME: StringKey = "__typename".intern();
    static ref FETCH_TOKEN_FIELD_NAME: StringKey = "__token".intern();

    /// Relay extension field that's available on all types.
    static ref CLIENT_ID_FIELD_NAME: StringKey = "__id".intern();
    static ref MATCH_NAME: StringKey = "match".intern();
    static ref SUPPORTED_NAME: StringKey = "supported".intern();

    static ref FIXME_FAT_INTERFACE: StringKey = "fixme_fat_interface".intern();

    static ref DIRECTIVE_UNCHECKED_ARGUMENTS: StringKey = "uncheckedArguments_DEPRECATED".intern();
    pub static ref DIRECTIVE_ARGUMENTS: StringKey = "arguments".intern();
}

/// The semantic of defining variables on a fragment definition.
#[derive(Copy, Clone, PartialEq)]
pub enum FragmentVariablesSemantic {
    /// Fragment variables are not allowed.
    Disabled,
    /// The variable definitions are variables on the operation.
    GlobalVariableDefinition,
    /// The variable definitions are similar to function calls and can be
    /// passed with @arguments on fragment spreads.
    PassedValue,
}

#[derive(Clone, Copy)]
pub struct BuilderOptions {
    /// Do not error when a fragment spread references a fragment that is not
    /// defined in the same program.
    pub allow_undefined_fragment_spreads: bool,

    /// The semantic of defining variables on a fragment definition.
    pub fragment_variables_semantic: FragmentVariablesSemantic,

    /// Enable a Relay special cases:
    /// - Fields with a @match directive do not require to pass the non-nullable
    ///   `supported` argument.
    pub relay_mode: bool,
}

/// Converts a self-contained corpus of definitions into typed IR, or returns
/// a list of errors if the corpus is invalid.
/// NOTE: Uses Relay defaults.
pub fn build_ir_with_relay_options(
    schema: &SDLSchema,
    definitions: &[graphql_syntax::ExecutableDefinition],
) -> DiagnosticsResult<Vec<ExecutableDefinition>> {
    let signatures = build_signatures(schema, &definitions)?;
    par_try_map(definitions, |definition| {
        let mut builder = Builder::new(
            schema,
            &signatures,
            definition.location(),
            BuilderOptions {
                allow_undefined_fragment_spreads: false,
                fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
                relay_mode: true,
            },
        );
        builder.build_definition(definition)
    })
}

/// Converts a self-contained corpus of definitions into typed IR, or returns
/// a list of errors if the corpus is invalid. `options` can be set to
/// control the builder activities.
pub fn build_ir_with_extra_features(
    schema: &SDLSchema,
    definitions: &[graphql_syntax::ExecutableDefinition],
    options: BuilderOptions,
) -> DiagnosticsResult<Vec<ExecutableDefinition>> {
    let signatures = build_signatures(schema, &definitions)?;
    par_try_map(definitions, |definition| {
        let mut builder = Builder::new(schema, &signatures, definition.location(), options);
        builder.build_definition(definition)
    })
}

pub fn build_type_annotation(
    schema: &SDLSchema,
    annotation: &graphql_syntax::TypeAnnotation,
    location: Location,
) -> DiagnosticsResult<TypeReference> {
    let signatures = Default::default();
    let mut builder = Builder::new(
        schema,
        &signatures,
        location,
        BuilderOptions {
            allow_undefined_fragment_spreads: false,
            fragment_variables_semantic: FragmentVariablesSemantic::Disabled,
            relay_mode: false,
        },
    );
    builder.build_type_annotation(annotation)
}

pub fn build_constant_value(
    schema: &SDLSchema,
    value: &graphql_syntax::ConstantValue,
    type_: &TypeReference,
    location: Location,
    validation: ValidationLevel,
) -> DiagnosticsResult<ConstantValue> {
    let signatures = Default::default();
    let mut builder = Builder::new(
        schema,
        &signatures,
        location,
        BuilderOptions {
            allow_undefined_fragment_spreads: false,
            fragment_variables_semantic: FragmentVariablesSemantic::Disabled,
            relay_mode: false,
        },
    );
    builder.build_constant_value(value, type_, validation)
}

pub fn build_variable_definitions(
    schema: &SDLSchema,
    definitions: &[graphql_syntax::VariableDefinition],
    location: Location,
) -> DiagnosticsResult<Vec<VariableDefinition>> {
    let signatures = Default::default();
    let mut builder = Builder::new(
        schema,
        &signatures,
        location,
        BuilderOptions {
            allow_undefined_fragment_spreads: false,
            fragment_variables_semantic: FragmentVariablesSemantic::Disabled,
            relay_mode: false,
        },
    );
    builder.build_variable_definitions(definitions)
}

// Helper Types

type VariableDefinitions = FnvHashMap<StringKey, VariableDefinition>;
type UsedVariables = IndexMap<StringKey, VariableUsage, FnvBuildHasher>;

#[derive(Debug)]
struct VariableUsage {
    span: Span,
    type_: TypeReference,
}

struct Builder<'schema, 'signatures> {
    schema: &'schema SDLSchema,
    signatures: &'signatures FragmentSignatures,
    location: Location,
    defined_variables: VariableDefinitions,
    used_variables: UsedVariables,
    options: BuilderOptions,
}

impl<'schema, 'signatures> Builder<'schema, 'signatures> {
    pub fn new(
        schema: &'schema SDLSchema,
        signatures: &'signatures FragmentSignatures,
        location: Location,
        options: BuilderOptions,
    ) -> Self {
        Self {
            schema,
            signatures,
            location,
            defined_variables: Default::default(),
            used_variables: UsedVariables::default(),
            options,
        }
    }

    pub fn build_definition(
        &mut self,
        definition: &graphql_syntax::ExecutableDefinition,
    ) -> DiagnosticsResult<ExecutableDefinition> {
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
    ) -> DiagnosticsResult<FragmentDefinition> {
        let signature = self
            .signatures
            .get(&fragment.name.value)
            .expect("Expected signature to be created");
        let fragment_type = TypeReference::Named(signature.type_condition);

        self.defined_variables = signature
            .variable_definitions
            .iter()
            .map(|x| (x.name.item, x.clone()))
            .collect();

        let directives =
            self.build_directives(&fragment.directives, DirectiveLocation::FragmentDefinition);
        let selections = self.build_selections(&fragment.selections.items, &fragment_type);
        let (directives, selections) = try2(directives, selections)?;
        let used_global_variables = self
            .used_variables
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
    ) -> DiagnosticsResult<OperationDefinition> {
        let name = match &operation.name {
            Some(name) => name,
            None => {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::ExpectedOperationName(),
                    operation.location,
                )]);
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
                return Err(vec![Diagnostic::error(
                    ValidationMessage::UnsupportedOperation(kind),
                    operation.location,
                )]);
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
        // assert the subscription only contains one selection
        if let OperationKind::Subscription = kind {
            if operation.selections.items.len() != 1 {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::GenerateSubscriptionNameSingleSelectionItem {
                        subscription_name: name.value,
                    },
                    operation.location,
                )]);
            }
        }
        let selections =
            self.build_selections(&operation.selections.items, &operation_type_reference);
        let (directives, selections) = try2(directives, selections)?;
        if !self.used_variables.is_empty() {
            Err(self
                .used_variables
                .iter()
                .map(|(undefined_variable, usage)| {
                    Diagnostic::error(
                        ValidationMessage::ExpectedOperationVariableToBeDefined(
                            *undefined_variable,
                        ),
                        self.location.with_span(usage.span),
                    )
                })
                .collect())
        } else {
            Ok(OperationDefinition {
                kind,
                name: name.name_with_location(self.location.source_location()),
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
    ) -> DiagnosticsResult<Vec<VariableDefinition>> {
        // check for duplicate variables
        let mut seen_variables: FnvHashMap<StringKey, Span> = FnvHashMap::default();
        for variable in definitions {
            if let Some(other_variable_span) = seen_variables.get(&variable.name.name) {
                return Err(vec![
                    Diagnostic::error(
                        ValidationMessage::DuplicateVariable {
                            name: variable.name.name,
                        },
                        self.location.with_span(variable.span),
                    )
                    .annotate(
                        "conflicts with",
                        self.location.with_span(*other_variable_span),
                    ),
                ]);
            }
            seen_variables.insert(variable.name.name, variable.span);
        }
        try_map(definitions, |definition| {
            self.build_variable_definition(definition)
        })
    }

    fn build_variable_definition(
        &mut self,
        definition: &graphql_syntax::VariableDefinition,
    ) -> DiagnosticsResult<VariableDefinition> {
        let type_ = self.build_type_annotation(&definition.type_)?;
        if !type_.inner().is_input_type() {
            return Err(vec![Diagnostic::error(
                ValidationMessage::ExpectedVariablesToHaveInputType(
                    self.schema.get_type_name(type_.inner()),
                ),
                self.location.with_span(definition.span),
            )]);
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
            name: definition
                .name
                .name_with_location(self.location.source_location()),
            type_,
            default_value,
            directives,
        })
    }

    fn build_type_annotation(
        &mut self,
        annotation: &graphql_syntax::TypeAnnotation,
    ) -> DiagnosticsResult<TypeReference> {
        self.build_type_annotation_inner(annotation)
    }

    fn build_type_annotation_inner(
        &mut self,
        annotation: &graphql_syntax::TypeAnnotation,
    ) -> DiagnosticsResult<TypeReference> {
        match annotation {
            graphql_syntax::TypeAnnotation::Named(name) => match self.schema.get_type(name.value) {
                Some(type_) => Ok(TypeReference::Named(type_)),
                None => Err(vec![Diagnostic::error(
                    ValidationMessage::UnknownType(name.value),
                    self.location.with_span(name.span),
                )]),
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
    ) -> DiagnosticsResult<Vec<Selection>> {
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
                split_conditions_and_directives(&next_selection.directives());

            // If conditions are empty -> return the original selection
            if conditions.is_empty() {
                return Ok(next_selection);
            }

            // If not, then updated directives
            next_selection.set_directives(directives);

            // And wrap the original selection with `Selection::Condition`
            Ok(wrap_selection_with_conditions(next_selection, conditions))
        })
    }

    fn build_selection(
        &mut self,
        selection: &graphql_syntax::Selection,
        parent_type: &TypeReference,
    ) -> DiagnosticsResult<Selection> {
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

    fn build_fragment_spread_arguments(
        &mut self,
        signature: &FragmentSignature,
        arg_list: &List<graphql_syntax::Argument>,
        validation_level: ValidationLevel,
    ) -> DiagnosticsResult<Vec<Argument>> {
        let mut has_invalid_arg = false;
        let mut errors = Vec::new();
        for variable_definition in &signature.variable_definitions {
            if variable_definition.type_.is_non_null()
                && variable_definition.default_value.is_none()
                && arg_list
                    .items
                    .named(variable_definition.name.item)
                    .is_none()
            {
                errors.push(
                    Diagnostic::error(
                        ValidationMessage::MissingRequiredFragmentArgument {
                            argument_name: variable_definition.name.item,
                        },
                        self.location.with_span(arg_list.span),
                    )
                    .annotate(
                        "defined on the fragment here",
                        variable_definition.name.location,
                    ),
                );
            }
        }
        if !errors.is_empty() {
            return Err(errors);
        }
        let result: DiagnosticsResult<Vec<Argument>> = arg_list
            .items
            .iter()
            .map(|arg| {
                if let Some(argument_definition) =
                    signature.variable_definitions.named(arg.name.value)
                {
                    // TODO: We didn't use to enforce types of @args/@argDefs properly, which resulted
                    // in a lot of code that is technically valid but doesn't type-check. Specifically,
                    // many fragment @argDefs are typed as non-null but used in places that accept a
                    // nullable value. Similarly, the corresponding @args pass nullable values. This
                    // works since ultimately a nullable T flows into a nullable T, but isn't
                    // technically correct. There are also @argDefs are typed with different types,
                    // but the persist query allowed them as the types are the same underlyingly.
                    // NOTE: We keep the same behavior as JS compiler for now, where we don't validate
                    // types of variables passed to @args at all
                    let arg_result = self.build_argument(
                        arg,
                        &argument_definition.type_,
                        ValidationLevel::Strict,
                    );
                    if arg_result.is_err() && validation_level == ValidationLevel::Loose {
                        has_invalid_arg = true;
                        self.build_argument(arg, &argument_definition.type_, ValidationLevel::Loose)
                    } else {
                        arg_result
                    }
                } else if validation_level == ValidationLevel::Loose {
                    has_invalid_arg = true;
                    Ok(self.build_argument(
                        arg,
                        self.schema.unchecked_argument_type_sentinel(),
                        ValidationLevel::Loose,
                    )?)
                } else {
                    Err(vec![Diagnostic::error(
                        ValidationMessage::UnknownArgument(arg.name.value),
                        self.location.with_span(arg.span),
                    )])
                }
            })
            .collect();
        if validation_level == ValidationLevel::Loose && !has_invalid_arg {
            Err(vec![Diagnostic::error(
                ValidationMessage::UnnecessaryUncheckedArgumentsDirective,
                self.location.with_span(arg_list.span),
            )])
        } else {
            result
        }
    }

    fn build_fragment_spread(
        &mut self,
        spread: &graphql_syntax::FragmentSpread,
        parent_type: &TypeReference,
    ) -> DiagnosticsResult<FragmentSpread> {
        let spread_name_with_location = spread
            .name
            .name_with_location(self.location.source_location());

        // Exit early if the fragment does not exist
        let signature = match self.signatures.get(&spread.name.value) {
            Some(fragment) => fragment,
            None if self.options.allow_undefined_fragment_spreads => {
                let directives = if self.options.relay_mode {
                    self.build_directives(
                        spread.directives.iter().filter(|directive| {
                            directive.name.value != *DIRECTIVE_ARGUMENTS
                                && directive.name.value != *DIRECTIVE_UNCHECKED_ARGUMENTS
                        }),
                        DirectiveLocation::FragmentSpread,
                    )?
                } else {
                    self.build_directives(&spread.directives, DirectiveLocation::FragmentSpread)?
                };
                return Ok(FragmentSpread {
                    fragment: spread_name_with_location,
                    arguments: Vec::new(),
                    directives,
                });
            }
            None => {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::UndefinedFragment(spread.name.value),
                    self.location.with_span(spread.span),
                )]);
            }
        };

        if !self
            .schema
            .are_overlapping_types(parent_type.inner(), signature.type_condition)
        {
            // no possible overlap
            return Err(vec![Diagnostic::error(
                ValidationMessage::InvalidFragmentSpreadType {
                    fragment_name: spread.name.value,
                    parent_type: self.schema.get_type_name(parent_type.inner()),
                    type_condition: self.schema.get_type_name(signature.type_condition),
                },
                self.location.with_span(spread.span),
            )]);
        }

        if self.options.fragment_variables_semantic != FragmentVariablesSemantic::PassedValue {
            let directives =
                self.build_directives(spread.directives.iter(), DirectiveLocation::FragmentSpread)?;
            return Ok(FragmentSpread {
                fragment: spread_name_with_location,
                arguments: Vec::new(),
                directives,
            });
        }

        let (mut argument_directives, other_directives) = spread
            .directives
            .iter()
            .partition::<Vec<_>, _>(|directive| {
                directive.name.value == *DIRECTIVE_ARGUMENTS
                    || directive.name.value == *DIRECTIVE_UNCHECKED_ARGUMENTS
            });

        if argument_directives.len() > 1 {
            let mut locations = argument_directives
                .iter()
                .map(|x| self.location.with_span(x.span));
            let mut error = Diagnostic::error(
                ValidationMessage::ExpectedOneArgumentsDirective(),
                locations.next().unwrap(),
            );
            for location in locations {
                error = error.annotate("duplicate definition", location);
            }
            return Err(vec![error]);
        }

        let arguments = if let Some(graphql_syntax::Directive {
            name,
            arguments: Some(arg_list),
            ..
        }) = argument_directives.pop()
        {
            let validation_level = if name.value == *DIRECTIVE_UNCHECKED_ARGUMENTS {
                ValidationLevel::Loose
            } else {
                ValidationLevel::Strict
            };
            self.build_fragment_spread_arguments(&signature, &arg_list, validation_level)
        } else {
            let errors: Vec<_> = signature
                .variable_definitions
                .iter()
                .filter(|variable_definition| {
                    variable_definition.type_.is_non_null()
                        && variable_definition.default_value.is_none()
                })
                .map(|variable_definition| {
                    Diagnostic::error(
                        ValidationMessage::MissingRequiredFragmentArgument {
                            argument_name: variable_definition.name.item,
                        },
                        self.location.with_span(spread.span),
                    )
                    .annotate(
                        "defined on the fragment here",
                        variable_definition.name.location,
                    )
                })
                .collect();
            if !errors.is_empty() {
                return Err(errors);
            }
            Ok(Default::default())
        };

        let directives = self.build_directives(other_directives, DirectiveLocation::FragmentSpread);
        let (arguments, directives) = try2(arguments, directives)?;
        Ok(FragmentSpread {
            fragment: spread_name_with_location,
            arguments,
            directives,
        })
    }

    fn build_inline_fragment(
        &mut self,
        fragment: &graphql_syntax::InlineFragment,
        parent_type: &TypeReference,
    ) -> DiagnosticsResult<InlineFragment> {
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
                            return Err(vec![Diagnostic::error(
                                ValidationMessage::ExpectedCompositeType(type_condition),
                                self.location.with_span(type_condition_node.type_.span),
                            )]);
                        }
                    },
                    None => {
                        return Err(vec![Diagnostic::error(
                            ValidationMessage::UnknownType(type_name),
                            self.location.with_span(type_condition_node.type_.span),
                        )]);
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
                return Err(vec![Diagnostic::error(
                    ValidationMessage::InvalidInlineFragmentTypeCondition {
                        parent_type: self.schema.get_type_name(parent_type.inner()),
                        type_condition: self.schema.get_type_name(type_condition),
                    },
                    self.location.with_span(fragment.span),
                )]);
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
    ) -> DiagnosticsResult<LinkedField> {
        let span = field.name.span;
        let field_id = match self.lookup_field(
            parent_type.inner(),
            field.name.value,
            &field.arguments,
            &field.directives,
        ) {
            Some(field_id) => field_id,
            None => {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::UnknownField {
                        type_: self.schema.get_type_name(parent_type.inner()),
                        field: field.name.value,
                    },
                    self.location.with_span(span),
                )]);
            }
        };
        let field_definition = self.schema.field(field_id);
        if field_definition.type_.inner().is_scalar() || field_definition.type_.inner().is_enum() {
            return Err(vec![Diagnostic::error(
                ValidationMessage::InvalidSelectionsOnScalarField {
                    type_name: self.schema.get_type_name(parent_type.inner()),
                    field_name: field.name.value,
                },
                self.location.with_span(span),
            )]);
        }
        let alias = self.build_alias(&field.alias);
        let relay_supported_arg_optional = self.options.relay_mode;
        let arguments = self.build_arguments(
            field.name.span,
            &field.arguments,
            &field_definition.arguments,
            |arg_name: &StringKey| {
                if relay_supported_arg_optional {
                    field.directives.named(*MATCH_NAME).is_none() || *arg_name != *SUPPORTED_NAME
                } else {
                    true
                }
            },
        );
        let selections = self.build_selections(&field.selections.items, &field_definition.type_);
        let directives = self.build_directives(&field.directives, DirectiveLocation::Field);
        let (arguments, selections, directives) = try3(arguments, selections, directives)?;
        Ok(LinkedField {
            alias,
            definition: WithLocation::from_span(self.location.source_location(), span, field_id),
            arguments,
            directives,
            selections,
        })
    }

    fn build_scalar_field(
        &mut self,
        field: &graphql_syntax::ScalarField,
        parent_type: &TypeReference,
    ) -> DiagnosticsResult<ScalarField> {
        let field_name = field.name.value;
        if field_name == *TYPENAME_FIELD_NAME {
            return self.build_typename_field(field);
        } else if self.options.relay_mode && field_name == *CLIENT_ID_FIELD_NAME {
            return self.build_clientid_field(field);
        } else if field_name == *FETCH_TOKEN_FIELD_NAME {
            return self.build_fetch_token_field(field);
        };
        let span = field.name.span;
        let field_id = match self.lookup_field(
            parent_type.inner(),
            field_name,
            &field.arguments,
            &field.directives,
        ) {
            Some(field_id) => field_id,
            None => {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::UnknownField {
                        type_: self.schema.get_type_name(parent_type.inner()),
                        field: field_name,
                    },
                    self.location.with_span(span),
                )]);
            }
        };
        let field_definition = self.schema.field(field_id);
        if !field_definition.type_.inner().is_scalar() && !field_definition.type_.inner().is_enum()
        {
            return Err(vec![Diagnostic::error(
                ValidationMessage::ExpectedSelectionsOnObjectField {
                    type_name: self.schema.get_type_name(parent_type.inner()),
                    field_name,
                },
                self.location.with_span(span),
            )]);
        }
        let alias = self.build_alias(&field.alias);
        let arguments = self.build_arguments(
            field.name.span,
            &field.arguments,
            &field_definition.arguments,
            |_| true,
        );
        let directives = self.build_directives(&field.directives, DirectiveLocation::Field);
        let (arguments, directives) = try2(arguments, directives)?;

        Ok(ScalarField {
            alias,
            definition: WithLocation::from_span(self.location.source_location(), span, field_id),
            arguments,
            directives,
        })
    }

    fn build_clientid_field(
        &mut self,
        field: &graphql_syntax::ScalarField,
    ) -> DiagnosticsResult<ScalarField> {
        let field_id = self.schema.clientid_field();
        let alias = self.build_alias(&field.alias);
        if let Some(arguments) = &field.arguments {
            return Err(vec![Diagnostic::error(
                ValidationMessage::InvalidArgumentsOnTypenameField(),
                self.location.with_span(arguments.span),
            )]);
        }
        let directives = self.build_directives(&field.directives, DirectiveLocation::Field)?;
        Ok(ScalarField {
            alias,
            definition: WithLocation::from_span(
                self.location.source_location(),
                field.name.span,
                field_id,
            ),
            arguments: Default::default(),
            directives,
        })
    }

    fn build_typename_field(
        &mut self,
        field: &graphql_syntax::ScalarField,
    ) -> DiagnosticsResult<ScalarField> {
        let field_id = self.schema.typename_field();
        let alias = self.build_alias(&field.alias);
        if let Some(arguments) = &field.arguments {
            return Err(vec![Diagnostic::error(
                ValidationMessage::InvalidArgumentsOnTypenameField(),
                self.location.with_span(arguments.span),
            )]);
        }
        let directives = self.build_directives(&field.directives, DirectiveLocation::Field)?;
        Ok(ScalarField {
            alias,
            definition: WithLocation::from_span(
                self.location.source_location(),
                field.name.span,
                field_id,
            ),
            arguments: Default::default(),
            directives,
        })
    }

    fn build_fetch_token_field(
        &mut self,
        field: &graphql_syntax::ScalarField,
    ) -> DiagnosticsResult<ScalarField> {
        let field_id = self.schema.fetch_token_field();
        let alias = self.build_alias(&field.alias);
        if let Some(arguments) = &field.arguments {
            return Err(Diagnostic::error(
                ValidationMessage::InvalidArgumentsOnFetchTokenField(),
                self.location.with_span(arguments.span),
            )
            .into());
        }
        let directives = self.build_directives(&field.directives, DirectiveLocation::Field)?;
        Ok(ScalarField {
            alias,
            definition: WithLocation::from_span(
                self.location.source_location(),
                field.name.span,
                field_id,
            ),
            arguments: Default::default(),
            directives,
        })
    }

    fn build_alias(
        &mut self,
        alias: &Option<graphql_syntax::Alias>,
    ) -> Option<WithLocation<StringKey>> {
        alias.as_ref().map(|alias| {
            alias
                .alias
                .name_with_location(self.location.source_location())
        })
    }

    fn build_arguments(
        &mut self,
        span: Span,
        arguments: &Option<graphql_syntax::List<graphql_syntax::Argument>>,
        argument_definitions: &ArgumentDefinitions,
        is_non_nullable_field_required: impl Fn(&StringKey) -> bool,
    ) -> DiagnosticsResult<Vec<Argument>> {
        // check for missing required (non-nullable) arguments
        let missing_arg_names = argument_definitions
            .iter()
            .filter(|arg_def| arg_def.type_.is_non_null())
            .filter(|required_arg_def| {
                arguments
                    .iter()
                    .flat_map(|args| &args.items)
                    .all(|arg| arg.name.value != required_arg_def.name)
            })
            .map(|missing_arg| missing_arg.name)
            .filter(is_non_nullable_field_required)
            .collect::<Vec<_>>();
        if !missing_arg_names.is_empty() {
            return Err(vec![Diagnostic::error(
                ValidationMessage::MissingRequiredArguments { missing_arg_names },
                self.location.with_span(span),
            )]);
        }

        if let Some(arguments) = arguments {
            // check for duplicate arguments
            for (i, arg) in arguments.items.iter().enumerate() {
                for other_arg in arguments.items.iter().skip(i + 1) {
                    if arg.name.value == other_arg.name.value {
                        return Err(vec![
                            Diagnostic::error(
                                ValidationMessage::DuplicateArgument {
                                    name: arg.name.value,
                                },
                                self.location.with_span(arg.span),
                            )
                            .annotate("conflicts with", self.location.with_span(other_arg.span)),
                        ]);
                    }
                }
            }

            arguments
                .items
                .iter()
                .map(
                    |argument| match argument_definitions.named(argument.name.value) {
                        Some(argument_definition) => self.build_argument(
                            argument,
                            &argument_definition.type_,
                            ValidationLevel::Strict,
                        ),
                        None => Err(vec![Diagnostic::error(
                            ValidationMessage::UnknownArgument(argument.name.value),
                            self.location.with_span(argument.name.span),
                        )]),
                    },
                )
                .collect()
        } else {
            Ok(vec![])
        }
    }

    fn build_directives<'a>(
        &mut self,
        directives: impl IntoIterator<Item = &'a graphql_syntax::Directive>,
        location: DirectiveLocation,
    ) -> DiagnosticsResult<Vec<Directive>> {
        let directives = try_map(directives, |directive| {
            self.build_directive(directive, location)
        })?;

        // Check for repeated directives that are not @repeatable
        if directives.len() > 1 {
            for (index, directive) in directives.iter().enumerate() {
                let directive_repeatable = self.schema.get_directive(directive.name.item).map_or(
                    // Default to `false` instead of expecting a definition
                    // since @arguments directive is not defined in the schema.
                    false,
                    |dir| dir.repeatable,
                );
                if directive_repeatable {
                    continue;
                }
                if let Some(repeated_directive) = directives
                    .iter()
                    .skip(index + 1)
                    .find(|other_directive| other_directive.name.item == directive.name.item)
                {
                    return Err(vec![
                        Diagnostic::error(
                            ValidationMessage::RepeatedNonRepeatableDirective {
                                name: directive.name.item,
                            },
                            repeated_directive.name.location,
                        )
                        .annotate("previously used here", directive.name.location),
                    ]);
                }
            }
        }

        Ok(directives)
    }

    fn build_directive(
        &mut self,
        directive: &graphql_syntax::Directive,
        location: DirectiveLocation,
    ) -> DiagnosticsResult<Directive> {
        if directive.name.value == *ARGUMENT_DEFINITION {
            if location != DirectiveLocation::FragmentDefinition {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::ExpectedArgumentDefinitionsDirectiveOnFragmentDefinition(),
                    self.location.with_span(directive.name.span),
                )]);
            }
            return Ok(Directive {
                name: directive
                    .name
                    .name_with_location(self.location.source_location()),
                arguments: vec![],
            });
        }
        let directive_definition = match self.schema.get_directive(directive.name.value) {
            Some(directive_definition) => directive_definition,
            None => {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::UnknownDirective(directive.name.value),
                    self.location.with_span(directive.name.span),
                )]);
            }
        };
        if !directive_definition.locations.contains(&location) {
            return Err(vec![Diagnostic::error(
                ValidationMessage::InvalidDirectiveUsageUnsupportedLocation(directive.name.value),
                self.location.with_span(directive.name.span),
            )]);
        }
        let arguments = self.build_arguments(
            directive.name.span,
            &directive.arguments,
            &directive_definition.arguments,
            |_| true,
        )?;
        Ok(Directive {
            name: directive
                .name
                .name_with_location(self.location.source_location()),
            arguments,
        })
    }

    fn build_argument(
        &mut self,
        argument: &graphql_syntax::Argument,
        type_: &TypeReference,
        validation: ValidationLevel,
    ) -> DiagnosticsResult<Argument> {
        let value_span = argument.value.span();
        let value = self.build_value(&argument.value, type_, validation)?;
        Ok(Argument {
            name: argument
                .name
                .name_with_location(self.location.source_location()),
            value: WithLocation::from_span(self.location.source_location(), value_span, value),
        })
    }

    fn build_variable(
        &mut self,
        variable: &graphql_syntax::VariableIdentifier,
        used_as_type: &TypeReference,
        validation: ValidationLevel,
    ) -> DiagnosticsResult<Variable> {
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
                return Err(vec![Diagnostic::error(
                    ValidationMessage::InvalidVariableUsage {
                        defined_type,
                        used_type,
                    },
                    self.location.with_span(variable.span),
                )]);
            }
        } else if let Some(prev_usage) = self.used_variables.get(&variable.name) {
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
                return Err(vec![
                    Diagnostic::error(
                        ValidationMessage::IncompatibleVariableUsage {
                            prev_type,
                            next_type,
                        },
                        next_span,
                    )
                    .annotate("is incompatible with", prev_span),
                ]);
            }
            // If the currently used type is a subtype of the previous usage, then it could
            // be a narrower type. Update our inference to reflect the stronger requirements.
            if is_used_subtype {
                self.used_variables.insert(
                    variable.name,
                    VariableUsage {
                        type_: used_as_type.clone(),
                        span: variable.span,
                    },
                );
            }
        } else {
            self.used_variables.insert(
                variable.name,
                VariableUsage {
                    type_: used_as_type.clone(),
                    span: variable.span,
                },
            );
        }
        Ok(Variable {
            name: variable.name_with_location(self.location.source_location()),
            type_: used_as_type.clone(),
        })
    }

    fn build_value(
        &mut self,
        value: &graphql_syntax::Value,
        type_: &TypeReference,
        validation: ValidationLevel,
    ) -> DiagnosticsResult<Value> {
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
                    let items: DiagnosticsResult<Vec<Value>> = list
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
                    let type_definition = self.schema.input_object(*id);
                    self.build_input_object(value, type_definition)
                }
                Type::Enum(id) => {
                    let type_definition = self.schema.enum_(*id);
                    Err(vec![Diagnostic::error(
                        ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                        self.location.with_span(value.span()),
                    )])
                }
                Type::Scalar(id) => {
                    let type_definition = self.schema.scalar(*id);
                    Err(vec![Diagnostic::error(
                        ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                        self.location.with_span(value.span()),
                    )])
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
    ) -> DiagnosticsResult<Value> {
        let object = match value {
            graphql_syntax::Value::Object(object) => object,
            graphql_syntax::Value::Constant(_) => {
                unreachable!("Constants should fall into the build_constant_input_object path")
            }
            _ => {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                    self.location.with_span(value.span()),
                )]);
            }
        };
        let mut seen_fields: FnvHashMap<StringKey, Span> = FnvHashMap::default();
        let mut required_fields: FnvHashSet<StringKey> = type_definition
            .fields
            .iter()
            .filter(|x| x.type_.is_non_null())
            .map(|x| x.name)
            .collect();

        let fields: DiagnosticsResult<Vec<Argument>> = object
            .items
            .iter()
            .map(|x| match type_definition.fields.named(x.name.value) {
                Some(field_definition) => {
                    required_fields.remove(&x.name.value);
                    let prev_span = seen_fields.insert(x.name.value, x.name.span);
                    if let Some(prev_span) = prev_span {
                        return Err(vec![
                            Diagnostic::error(
                                ValidationMessage::DuplicateInputField(x.name.value),
                                self.location.with_span(prev_span),
                            )
                            .annotate("also defined here", self.location.with_span(x.name.span)),
                        ]);
                    };

                    let value_span = x.value.span();
                    let value = self.build_value(
                        &x.value,
                        &field_definition.type_,
                        ValidationLevel::Strict,
                    )?;
                    Ok(Argument {
                        name: x.name.name_with_location(self.location.source_location()),
                        value: WithLocation::from_span(
                            self.location.source_location(),
                            value_span,
                            value,
                        ),
                    })
                }
                None => Err(vec![Diagnostic::error(
                    ValidationMessage::UnknownField {
                        type_: type_definition.name,
                        field: x.name.value,
                    },
                    self.location.with_span(x.name.span),
                )]),
            })
            .collect();
        if required_fields.is_empty() {
            Ok(Value::Object(fields?))
        } else {
            let mut missing: Vec<StringKey> = required_fields.into_iter().map(|x| x).collect();
            missing.sort();
            Err(vec![Diagnostic::error(
                ValidationMessage::MissingRequiredFields(missing, type_definition.name),
                self.location.with_span(object.span),
            )])
        }
    }

    fn build_constant_value(
        &mut self,
        value: &graphql_syntax::ConstantValue,
        type_: &TypeReference,
        enum_validation: ValidationLevel,
    ) -> DiagnosticsResult<ConstantValue> {
        // Special case for null: if the type is nullable then just return null,
        // otherwise report an error since null is invalid. thereafter all
        // conversions can assume the input is not ConstantValue::Null.
        if let graphql_syntax::ConstantValue::Null(null) = &value {
            if type_.is_non_null() {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::ExpectedValueMatchingType(
                        self.schema.get_type_name(type_.inner()),
                    ),
                    self.location.with_span(null.span),
                )]);
            } else {
                return Ok(ConstantValue::Null());
            }
        }
        match type_.nullable_type() {
            TypeReference::List(item_type) => match value {
                graphql_syntax::ConstantValue::List(list) => {
                    let items: DiagnosticsResult<Vec<ConstantValue>> = list
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
                    let type_definition = self.schema.input_object(*id);
                    self.build_constant_input_object(value, type_definition, enum_validation)
                }
                Type::Enum(id) => {
                    let type_definition = self.schema.enum_(*id);
                    self.build_constant_enum(value, type_definition)
                }
                Type::Scalar(id) => {
                    let type_definition = self.schema.scalar(*id);
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
    ) -> DiagnosticsResult<ConstantValue> {
        let object = match value {
            graphql_syntax::ConstantValue::Object(object) => object,
            _ => {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                    self.location.with_span(value.span()),
                )]);
            }
        };
        let mut seen_fields: FnvHashMap<StringKey, Span> = FnvHashMap::default();
        let mut required_fields: FnvHashSet<StringKey> = type_definition
            .fields
            .iter()
            .filter(|x| x.type_.is_non_null())
            .map(|x| x.name)
            .collect();

        let fields: DiagnosticsResult<Vec<ConstantArgument>> = object
            .items
            .iter()
            .map(|x| match type_definition.fields.named(x.name.value) {
                Some(field_definition) => {
                    required_fields.remove(&x.name.value);
                    let prev_span = seen_fields.insert(x.name.value, x.name.span);
                    if let Some(prev_span) = prev_span {
                        return Err(vec![
                            Diagnostic::error(
                                ValidationMessage::DuplicateInputField(x.name.value),
                                self.location.with_span(prev_span),
                            )
                            .annotate("also defined here", self.location.with_span(x.name.span)),
                        ]);
                    };

                    let value_span = x.value.span();
                    let value =
                        self.build_constant_value(&x.value, &field_definition.type_, validation)?;
                    Ok(ConstantArgument {
                        name: x.name.name_with_location(self.location.source_location()),
                        value: WithLocation::from_span(
                            self.location.source_location(),
                            value_span,
                            value,
                        ),
                    })
                }
                None => Err(vec![Diagnostic::error(
                    ValidationMessage::UnknownField {
                        type_: type_definition.name,
                        field: x.name.value,
                    },
                    self.location.with_span(x.name.span),
                )]),
            })
            .collect();
        if required_fields.is_empty() {
            Ok(ConstantValue::Object(fields?))
        } else {
            let mut missing: Vec<StringKey> = required_fields.into_iter().map(|x| x).collect();
            missing.sort();
            Err(vec![Diagnostic::error(
                ValidationMessage::MissingRequiredFields(missing, type_definition.name),
                self.location.with_span(object.span),
            )])
        }
    }

    fn build_constant_enum(
        &mut self,
        node: &graphql_syntax::ConstantValue,
        type_definition: &Enum,
    ) -> DiagnosticsResult<ConstantValue> {
        let value = match node {
            graphql_syntax::ConstantValue::Enum(value) => value.value,
            graphql_syntax::ConstantValue::String(_) => {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::ExpectedEnumValueGotString(type_definition.name),
                    self.location.with_span(node.span()),
                )]);
            }
            _ => {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                    self.location.with_span(node.span()),
                )]);
            }
        };
        if type_definition
            .values
            .iter()
            .any(|enum_value| enum_value.value == value)
        {
            Ok(ConstantValue::Enum(value))
        } else {
            Err(vec![Diagnostic::error(
                ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                self.location.with_span(node.span()),
            )])
        }
    }

    fn build_constant_scalar(
        &mut self,
        value: &graphql_syntax::ConstantValue,
        type_definition: &Scalar,
    ) -> DiagnosticsResult<ConstantValue> {
        match type_definition.name.lookup() {
            "ID" => match value {
                graphql_syntax::ConstantValue::Int(node) => Ok(ConstantValue::Int(node.value)),
                graphql_syntax::ConstantValue::String(node) => {
                    Ok(ConstantValue::String(node.value))
                }
                _ => Err(vec![Diagnostic::error(
                    ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                    self.location.with_span(value.span()),
                )]),
            },
            "String" => match value {
                graphql_syntax::ConstantValue::String(node) => {
                    Ok(ConstantValue::String(node.value))
                }
                _ => Err(vec![Diagnostic::error(
                    ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                    self.location.with_span(value.span()),
                )]),
            },
            "Float" => match value {
                graphql_syntax::ConstantValue::Float(node) => Ok(ConstantValue::Float(node.value)),
                graphql_syntax::ConstantValue::Int(node) => {
                    Ok(ConstantValue::Float(From::from(node.value)))
                }
                _ => Err(vec![Diagnostic::error(
                    ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                    self.location.with_span(value.span()),
                )]),
            },
            "Boolean" => match value {
                graphql_syntax::ConstantValue::Boolean(node) => {
                    Ok(ConstantValue::Boolean(node.value))
                }
                _ => Err(vec![Diagnostic::error(
                    ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                    self.location.with_span(value.span()),
                )]),
            },
            "Int" => match value {
                graphql_syntax::ConstantValue::Int(node) => Ok(ConstantValue::Int(node.value)),
                _ => Err(vec![Diagnostic::error(
                    ValidationMessage::ExpectedValueMatchingType(type_definition.name),
                    self.location.with_span(value.span()),
                )]),
            },
            _ => Err(vec![Diagnostic::error(
                ValidationMessage::UnsupportedCustomScalarType(type_definition.name),
                self.location.with_span(value.span()),
            )]),
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
        if directives.named(*FIXME_FAT_INTERFACE).is_none() {
            return None;
        };
        // Handle @fixme_fat_interface: if present and the parent type is abstract, see
        // if one of the implementors has this field and if so use that definition.
        let possible_types = match parent_type {
            Type::Interface(id) => {
                let interface = self.schema.interface(id);
                Some(&interface.implementing_objects)
            }
            Type::Union(id) => {
                let union = self.schema.union(id);
                Some(&union.members)
            }
            Type::Object(_) => None,
            _ => unreachable!("Parent type of a field must be an interface, union, or object"),
        };
        if let Some(possible_types) = possible_types {
            for possible_type in possible_types {
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
}

#[derive(Copy, Clone, Eq, PartialEq)]
pub enum ValidationLevel {
    Strict,
    Loose,
}

fn split_conditions_and_directives(directives: &[Directive]) -> (Vec<Directive>, Vec<Directive>) {
    let (mut conditions, directives): (Vec<_>, Vec<_>) =
        directives.iter().cloned().partition(|directive| {
            let name = directive.name.item.lookup();
            name == "skip" || name == "include"
        });
    conditions.sort_by(
        |a, b| match (&a.arguments[0].value.item, &b.arguments[0].value.item) {
            (Value::Variable(a), Value::Variable(b)) => {
                a.name.item.lookup().cmp(b.name.item.lookup())
            }
            (Value::Constant(_), Value::Variable(_)) => Ordering::Less,
            (Value::Variable(_), Value::Constant(_)) => Ordering::Greater,
            (Value::Constant(_), Value::Constant(_)) => Ordering::Equal,
            _ => unreachable!("Unexpected variable type for the condition directive"),
        },
    );
    (conditions, directives)
}

fn wrap_selection_with_conditions(selection: Selection, conditions: Vec<Directive>) -> Selection {
    let mut result: Selection = selection;
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
