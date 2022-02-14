/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{DiagnosticDisplay, WithDiagnosticData};
use graphql_syntax::OperationKind;
use intern::string_key::{Intern, StringKey};
use schema::{Type, TypeReference};
use thiserror::Error;

/// Fixed set of validation errors with custom display messages
#[derive(Clone, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ValidationMessage {
    #[error("Duplicate definitions for '{0}'")]
    DuplicateDefinition(StringKey),

    #[error("Undefined fragment '{0}'")]
    UndefinedFragment(StringKey),

    #[error("Expected an object, interface, or union, found '{0:?}'")]
    ExpectedCompositeType(Type),

    #[error("Expected type '{0:?}")]
    ExpectedType(TypeReference),

    #[error("Expected no selections on scalar field `{field_name}` of type `{type_name}`")]
    InvalidSelectionsOnScalarField {
        field_name: StringKey,
        type_name: StringKey,
    },

    #[error("Unknown argument '{0}'")]
    UnknownArgument(StringKey),

    #[error("Unknown directive '{0}'")]
    UnknownDirective(StringKey),

    #[error(
        "Invalid use of @uncheckedArguments_DEPRECATED: all arguments are defined and of correct type, use @arguments instead."
    )]
    UnnecessaryUncheckedArgumentsDirective,

    #[error("Expected operation to have a name (e.g. 'query <Name>')")]
    ExpectedOperationName(),

    #[error("The schema does not support '{0}' operations")]
    UnsupportedOperation(OperationKind),

    #[error("Nested lists ('[[T]]' etc) are not supported")]
    UnsupportedNestListType(),

    #[error("Expected a value of type '{0}'")]
    ExpectedValueMatchingType(StringKey),

    #[error(
        "Expected value of type '{0}' to be a valid enum value, got string. Consider removing quotes."
    )]
    ExpectedEnumValueGotString(StringKey),

    #[error("Duplicate values found for field '{0}'")]
    DuplicateInputField(StringKey),

    #[error("Missing required fields '{0:?}' of type '{1}'")] // TODO: print joined
    MissingRequiredFields(Vec<StringKey>, StringKey),

    #[error("Unsupported (user-defined) scalar type '{0}'")]
    UnsupportedCustomScalarType(StringKey),

    #[error("Expected at-most one '@arguments' directive per fragment spread")]
    ExpectedOneArgumentsDirective(),

    #[error("Expected at-most one '@argumentDefinitions' directive per fragment spread")]
    ExpectedOneArgumentDefinitionsDirective(),

    #[error(
        "Cannot combine fragment variable definitions syntax with the '@argumentDefinitions' directive"
    )]
    VariableDefinitionsAndArgumentDirective(),

    #[error(
        "Expected `@argumentDefinitions` value to have a `type` field with a literal string value (e.g. `type: \"Int!\"`)"
    )]
    ExpectedArgumentDefinitionLiteralType(),

    #[error(
        "Expected `@argumentDefinitions` value to be an object with `type` and (optionally) `defaultValue` properties"
    )]
    ExpectedArgumentDefinitionToBeObject(),

    #[error("Expected '@argumentDefinitions' directive to be used on fragment definitions only.")]
    ExpectedArgumentDefinitionsDirectiveOnFragmentDefinition(),

    #[error("Non-nullable variable '{variable_name}' has a default value.")]
    NonNullableVariableHasDefaultValue { variable_name: StringKey },

    #[error(
        "Variable was defined as type '{defined_type}' but used where a variable of type '{used_type}' is expected."
    )]
    InvalidVariableUsage {
        defined_type: String,
        used_type: String,
    },

    #[error(
        "Variable was previously used as type '{prev_type}' but later used where type '{next_type}' is expected."
    )]
    IncompatibleVariableUsage {
        prev_type: String,
        next_type: String,
    },

    #[error("Expected variable `${0}` to be defined on the operation")]
    ExpectedOperationVariableToBeDefined(StringKey),

    #[error(
        "Expected argument definition to have an input type (scalar, enum, or input object), found type '{0}'"
    )]
    ExpectedFragmentArgumentToHaveInputType(StringKey),

    #[error(
        "Expected variable definition to have an input type (scalar, enum, or input object), found type '{0}'"
    )]
    ExpectedVariablesToHaveInputType(StringKey),

    #[error(
        "Invalid type '{type_condition}' in inline fragment, this type can never occur for parent type '{parent_type}'"
    )]
    InvalidInlineFragmentTypeCondition {
        parent_type: StringKey,
        type_condition: StringKey,
    },

    #[error(
        "Invalid fragment spread '{fragment_name}', the type of this fragment ('{type_condition}') can never occur for parent type '{parent_type}'"
    )]
    InvalidFragmentSpreadType {
        fragment_name: StringKey,
        parent_type: StringKey,
        type_condition: StringKey,
    },

    #[error("Directive '{0}' not supported in this location")]
    InvalidDirectiveUsageUnsupportedLocation(StringKey),

    #[error(
        "Invalid value passed to `@argumentDefinitions`, supported options include `type` and `defaultValue`, got `{0}`"
    )]
    InvalidArgumentDefinitionsKey(StringKey),

    #[error("Unexpected arguments on `__typename` field")]
    InvalidArgumentsOnTypenameField(),

    #[error("Unexpected arguments on '__token' field")]
    InvalidArgumentsOnFetchTokenField(),

    #[error("Relay does not allow aliasing fields to `{0}`.")]
    DisallowReservedAliasError(StringKey),

    #[error("Relay does not allow `__typename` field on Query, Mutation or Subscription.")]
    DisallowTypenameOnRoot(),

    #[error(
        "Unexpected directive: '{0}'. This directive can only be used on fields/fragments that are fetched from the server schema, but it is used inside a client-only selection."
    )]
    InvalidServerOnlyDirectiveInClientFields(StringKey),

    #[error(
        "@{connection_directive_name} used on invalid field '{connection_field_name}'. Expected the return type to be a non-plural interface or object, got '{connection_type_string}'."
    )]
    InvalidConnectionFieldType {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        connection_type_string: String,
    },

    #[error(
        "Expected field '{connection_field_name}' to have a '{first_arg}' or '{last_arg}' argument."
    )]
    ExpectedConnectionToHaveCountArgs {
        connection_field_name: StringKey,
        first_arg: StringKey,
        last_arg: StringKey,
    },

    #[error("Expected '{connection_field_name}' to have a '{edges_selection_name}' selection.")]
    ExpectedConnectionToHaveEdgesSelection {
        connection_field_name: StringKey,
        edges_selection_name: StringKey,
    },

    #[error(
        "@{connection_directive_name} used on invalid field '{connection_field_name}'. Expected the field type '{connection_type_name}' to expose a '{edges_selection_name}' field that returns a list of objects."
    )]
    ExpectedConnectionToExposeValidEdgesField {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        connection_type_name: StringKey,
        edges_selection_name: StringKey,
    },

    #[error(
        "@{connection_directive_name} used on invalid field '{connection_field_name}'. Expected the field type '{connection_type_name}' to expose a '{edges_selection_name} {{ {node_selection_name} }}' field that returns an object, interface or union."
    )]
    ExpectedConnectionToExposeValidNodeField {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        connection_type_name: StringKey,
        edges_selection_name: StringKey,
        node_selection_name: StringKey,
    },

    #[error(
        "@{connection_directive_name} used on invalid field '{connection_field_name}'. Expected the field type '{connection_type_name}' to expose a '{edges_selection_name} {{ {cursor_selection_name} }}' field that returns a scalar."
    )]
    ExpectedConnectionToExposeValidCursorField {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        connection_type_name: StringKey,
        cursor_selection_name: StringKey,
        edges_selection_name: StringKey,
    },

    #[error(
        "@{connection_directive_name} used on invalid field '{connection_field_name}'. Expected the field type '{connection_type_name}' to expose a '{page_info_selection_name}' field that returns an object."
    )]
    ExpectedConnectionToExposeValidPageInfoField {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        connection_type_name: StringKey,
        page_info_selection_name: StringKey,
    },

    #[error(
        "@{connection_directive_name} used on invalid field '{connection_field_name}'. Expected the field type '{connection_type_name}' to expose a '{page_info_selection_name} {{ {page_info_sub_field_name} }}' field that returns a scalar."
    )]
    ExpectedConnectionToExposeValidPageInfoSubField {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        connection_type_name: StringKey,
        page_info_selection_name: StringKey,
        page_info_sub_field_name: StringKey,
    },

    #[error(
        "Expected the {handler_arg_name} argument to @{connection_directive_name} to be a string literal for field '{connection_field_name}'."
    )]
    InvalidConnectionHandlerArg {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        handler_arg_name: StringKey,
    },

    #[error(
        "Expected the {key_arg_name} argument to @{connection_directive_name} to be a string literal for field '{connection_field_name}'."
    )]
    InvalidConnectionKeyArg {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        key_arg_name: StringKey,
    },

    #[error(
        "Expected the {dynamic_key_arg_name} argument to @{connection_directive_name} to be a variable for field '{connection_field_name}'."
    )]
    InvalidConnectionDynamicKeyArg {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        dynamic_key_arg_name: StringKey,
    },

    #[error(
        "Expected the {key_arg_name} argument to @{connection_directive_name} to be of form '<SomeName>_{postfix}', got '{key_arg_value}'. For a detailed explanation, check out https://relay.dev/docs/en/pagination-container#connection"
    )]
    InvalidConnectionKeyArgPostfix {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        key_arg_name: StringKey,
        key_arg_value: StringKey,
        postfix: String,
    },

    #[error(
        "Expected the {filters_arg_name} argument to @{connection_directive_name} to be a list of string literals for field '{connection_field_name}'."
    )]
    InvalidConnectionFiltersArg {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        filters_arg_name: StringKey,
    },

    #[error("@stream_connection does not support aliasing the '{field_name}' field.")]
    UnsupportedAliasingInStreamConnection { field_name: StringKey },

    #[error("Expected the `{0}` argument to @relay to be a boolean literal if specified.")]
    InvalidRelayDirectiveArg(StringKey),

    #[error("Cannot use @relay(mask: false) on fragment spreads for fragments with directives.")]
    InvalidUnmaskOnFragmentWithDirectives(),

    #[error(
        "Cannot use @relay(mask: false) on fragment spreads for fragments with @argumentDefinitions."
    )]
    InvalidUnmaskOnFragmentWithArguments(),

    #[error("Cannot combine global and local variables when applying @relay(mask: false")]
    InvalidUnmaskOnLocalAndGloablVariablesWithSameName(),

    #[error(
        "Cannot combine variables with incompatible types {prev_arg_type} and {next_arg_type} when applying @relay(mask: false"
    )]
    InvalidUnmaskOnVariablesOfIncompatibleTypesWithSameName {
        prev_arg_type: String,
        next_arg_type: String,
    },

    #[error(
        "Expected the '{arg_name}' value to @{directive_name} to be a string literal if provided."
    )]
    LiteralStringArgumentExpectedForDirective {
        arg_name: StringKey,
        directive_name: StringKey,
    },

    #[error("Variable `${variable_name}` is never used in operation `{operation_name}`")]
    UnusedVariable {
        variable_name: StringKey,
        operation_name: StringKey,
    },

    #[error(
        "Variable `${variable_name}` is never used in fragment `{fragment_name}`. `@argumentDefinitions` defines local variables, global variables are implicitly available."
    )]
    UnusedFragmentVariable {
        variable_name: StringKey,
        fragment_name: StringKey,
    },

    #[error(
        "Variable `${variable_name}` of fragment `{fragment_name}` is marked as unused using `unusedLocalVariable_DEPRECATED: true`, but is actually used. `unusedLocalVariable_DEPRECATED: true` should be removed."
    )]
    UselessUnusedFragmentVariableAnnotation {
        variable_name: StringKey,
        fragment_name: StringKey,
    },

    #[error(
        "`unusedLocalVariable_DEPRECATED` can only be set to a constant `true` value. Remove the `unusedLocalVariable_DEPRECATED` or update the value."
    )]
    InvalidUnusedFragmentVariableSuppressionArg,

    #[error(
        "Invalid usage of '@DEPRECATED__relay_ignore_unused_variables_error'. No unused variables found in the query '{operation_name}'."
    )]
    UnusedIgnoreUnusedVariablesDirective { operation_name: StringKey },

    #[error("Operation '{operation_name}' references undefined variable{variables_string}.")]
    GlobalVariables {
        operation_name: StringKey,
        variables_string: String,
    },

    #[error("Subscription '{subscription_name}' must have a single selection")]
    GenerateSubscriptionNameSingleSelectionItem { subscription_name: StringKey },

    #[error("The directive `@{name}` can only be used once at this location.")]
    RepeatedNonRepeatableDirective { name: StringKey },

    #[error("Module-provided variable ('{argument_name}') may not declare a default value")]
    ProvidedVariableIncompatibleWithDefaultValue { argument_name: StringKey },

    #[error("The field `{parent_name}.{field_name}` is deprecated.{}",
        match deprecation_reason {
            Some(reason) => format!(" Deprecation reason: \"{}\"", reason),
            None => "".to_string()
        }
    )]
    DeprecatedField {
        parent_name: StringKey,
        field_name: StringKey,
        deprecation_reason: Option<StringKey>,
    },

    #[error("Missing required {}: `{}`",
        if missing_arg_names.len() > 1 { "arguments" } else { "argument" },
        missing_arg_names
            .iter()
            .map(|arg| arg.lookup())
            .collect::<Vec<_>>()
            .join("`, `"))
    ]
    MissingRequiredArguments { missing_arg_names: Vec<StringKey> },

    #[error("Duplicate argument `{name}`")]
    DuplicateArgument { name: StringKey },

    #[error(
        "Required argument '{argument_name}: {type_string}' is missing on '{node_name}' in '{root_name}'."
    )]
    MissingRequiredArgument {
        argument_name: StringKey,
        type_string: String,
        node_name: StringKey,
        root_name: StringKey,
    },

    #[error("Missing required argument `{argument_name}` on this fragment spread.")]
    MissingRequiredFragmentArgument { argument_name: StringKey },

    #[error("Duplicate variable `{name}`")]
    DuplicateVariable { name: StringKey },

    #[error(
        "The `raw_response_type` argument should be set to `true` for the @no_inline fragment `{fragment_name}` used in the query with @raw_response_type."
    )]
    RequiredRawResponseTypeOnNoInline { fragment_name: StringKey },

    #[error("No fields can have an alias that start with two underscores.")]
    NoDoubleUnderscoreAlias,
}

#[derive(Clone, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ValidationMessageWithData {
    #[error("Unknown type '{type_name}'.{suggestions}", suggestions = did_you_mean(suggestions))]
    UnknownType {
        type_name: StringKey,
        suggestions: Vec<StringKey>,
    },

    #[error("The type `{type_}` has no field `{field}`.{suggestions}", suggestions = did_you_mean(suggestions))]
    UnknownField {
        type_: StringKey,
        field: StringKey,
        suggestions: Vec<StringKey>,
    },

    #[error("Expected selections on field `{field_name}` of type `{type_name}`")]
    ExpectedSelectionsOnObjectField {
        field_name: StringKey,
        type_name: StringKey,
    },
}

impl WithDiagnosticData for ValidationMessageWithData {
    fn get_data(&self) -> Vec<Box<dyn DiagnosticDisplay>> {
        match self {
            ValidationMessageWithData::UnknownType { suggestions, .. }
            | ValidationMessageWithData::UnknownField { suggestions, .. } => suggestions
                .iter()
                .map(|suggestion| into_box(*suggestion))
                .collect::<_>(),
            ValidationMessageWithData::ExpectedSelectionsOnObjectField { field_name, .. } => {
                vec![Box::new(format!("{} {{ }}", field_name))]
            }
        }
    }
}

fn into_box(item: StringKey) -> Box<dyn DiagnosticDisplay> {
    Box::new(item)
}

/// Given [ A, B, C ] return ' Did you mean A, B, or C?'.
fn did_you_mean(suggestions: &[StringKey]) -> String {
    if suggestions.is_empty() {
        return "".to_string();
    }

    let suggestions_string = match suggestions.len() {
        1 => format!("`{}`", suggestions[0].lookup()),
        2 => format!("`{}` or `{}`", suggestions[0], suggestions[1]),
        _ => {
            let mut suggestions = suggestions.to_vec();
            let last_option = suggestions.pop();

            format!(
                "{}, or `{}`",
                suggestions
                    .iter()
                    .map(|suggestion| format!("`{}`", suggestion.lookup()))
                    .collect::<Vec<String>>()
                    .join(", "),
                last_option.unwrap_or_else(|| "".intern())
            )
        }
    };

    format!(" Did you mean {}?", suggestions_string)
}
