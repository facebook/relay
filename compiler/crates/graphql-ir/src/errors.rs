/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{FileKey, Location};
use fnv::FnvHashMap;
use graphql_syntax::OperationKind;
use interner::StringKey;
use schema::{Type, TypeReference};
use std::fmt;
use thiserror::Error;

pub type ValidationResult<T> = Result<T, Vec<ValidationError>>;

pub type Sources<'a> = FnvHashMap<FileKey, &'a str>;

impl From<ValidationError> for Vec<ValidationError> {
    fn from(error: ValidationError) -> Self {
        vec![error]
    }
}

#[derive(Debug)]
pub struct ValidationError {
    /// One of a fixed set of validation errors
    message: ValidationMessage,

    /// A set of locations associated with the error. By convention
    /// the list should always be non-empty, with the first location
    /// indicating the primary source of the error and subsequent
    /// locations indicating related source code that provide
    /// context as to why the primary location is problematic.
    locations: Vec<Location>,
}

impl ValidationError {
    pub fn new(message: ValidationMessage, locations: Vec<Location>) -> Self {
        Self { message, locations }
    }

    /// Attaches sources to the error to allow it to be printed with a code
    /// listing without requring additional context.
    pub fn with_sources(self, sources: &Sources<'_>) -> ValidationErrorWithSources {
        let sources = self
            .locations
            .iter()
            .map(|location| {
                sources
                    .get(&location.file())
                    .map(|source| (*source).to_string())
            })
            .collect();
        ValidationErrorWithSources {
            error: self,
            sources,
        }
    }

    pub fn print(&self, sources: &FnvHashMap<FileKey, &str>) -> String {
        format!(
            "{}:\n{}",
            self.message,
            self.locations
                .iter()
                .map(|location| {
                    let source = match sources.get(&location.file()) {
                        Some(source) => source,
                        None => "<source not found>",
                    };
                    location.print(source)
                })
                .collect::<Vec<_>>()
                .join("\n\n")
        )
    }
}

#[derive(Debug)]
pub struct ValidationErrorWithSources {
    error: ValidationError,
    sources: Vec<Option<String>>,
}
impl fmt::Display for ValidationErrorWithSources {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{}:\n{}",
            self.error.message,
            self.error
                .locations
                .iter()
                .zip(&self.sources)
                .map(|(location, source)| match source {
                    Some(source) => location.print(&source),
                    None => "<source not found>".to_string(),
                })
                .collect::<Vec<_>>()
                .join("\n\n")
        )
    }
}

/// Fixed set of validation errors with custom display messages
#[derive(Clone, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ValidationMessage {
    #[error("Duplicate definitions for '{0}'")]
    DuplicateDefinition(StringKey),
    #[error("Unknown type '{0}'")]
    UnknownType(StringKey),
    #[error("Undefined fragment '{0}'")]
    UndefinedFragment(StringKey),
    #[error("Expected an object, interface, or union, found '{0:?}'")]
    ExpectedCompositeType(Type),
    #[error("Expected type '{0:?}")]
    ExpectedType(TypeReference),
    #[error("Unknown field '{type_}.{field}'")]
    UnknownField { type_: StringKey, field: StringKey },
    #[error("Expected no selections on scalar field '{0:?}.{1}'")]
    InvalidSelectionsOnScalarField(Type, StringKey),
    #[error("Expected selections on field '{0:?}.{1}'")]
    ExpectedSelectionsOnObjectField(Type, StringKey),
    #[error("Unknown argument '{0}'")]
    UnknownArgument(StringKey),
    #[error("Unknown directive '{0}'")]
    UnknownDirective(StringKey),
    #[error("Expected operation to have a name (e.g. 'query <Name>')")]
    ExpectedOperationName(),
    #[error("The schema does not support '{0}' operations")]
    UnsupportedOperation(OperationKind),
    #[error("Nested lists ('[[T]]' etc) are not supported")]
    UnsupportedNestListType(),
    #[error("Expected a value of type '{0}'")]
    ExpectedValueMatchingType(StringKey),
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
    #[error("{0}")]
    SyntaxError(graphql_syntax::SyntaxError),
    #[error("Expected @argumentDefinitions value to have a 'type' field with a literal string value (e.g. 'type: \"Int!\"')")]
    ExpectedArgumentDefinitionLiteralType(),
    #[error("Expected @argumentDefinitions value to be an object with 'type' and (optionally) 'defaultValue' properties")]
    ExpectedArgumentDefinitionToBeObject(),
    #[error("Variable was defined as type '{defined_type}' but used where a variable of type '{used_type}' is expected.")]
    InvalidVariableUsage {
        defined_type: String,
        used_type: String,
    },
    #[error("Variable was previously used as type '{prev_type}' but later used where type '{next_type}' is expected.")]
    IncompatibleVariableUsage {
        prev_type: String,
        next_type: String,
    },
    #[error("Expected operation variables to be defined")]
    ExpectedVariablesToBeDefined(),
    #[error("Expected argument definition to have an input type (scalar, enum, or input object), found type '{0}'")]
    ExpectedFragmentArgumentToHaveInputType(StringKey),
    #[error("Expected variable definition to have an input type (scalar, enum, or input object), found type '{0}'")]
    ExpectedVariablesToHaveInputType(StringKey),
    #[error("Invalid type '{type_condition}' in inline fragment, this type can never occur for parent type '{parent_type}'")]
    InvalidInlineFragmentTypeCondition {
        parent_type: String,
        type_condition: String,
    },
    #[error("Invalid fragment spread '{fragment_name}', the type of this fragment ('{type_condition}') can never occur for parent type '{parent_type}'")]
    InvalidFragmentSpreadType {
        fragment_name: StringKey,
        parent_type: String,
        type_condition: String,
    },
    #[error("Directive '{0}' not supported in this location")]
    InvalidDirectiveUsageUnsupportedLocation(StringKey),

    #[error("Invalid values passed to '@arguments', supported options include 'type' and 'defaultValue', got '{0}'")]
    InvalidArgumentsKeys(String),

    #[error("Unexpected arguments on '__typename' field")]
    InvalidArgumentsOnTypenameField(),

    #[error("Relay does not allow aliasing fields to `id`. This name is reserved for the globally unique `id` field on `Node`.")]
    DisallowIdAsAliasError(),

    #[error("Unexpected directive: '{0}'. This directive can only be used on fields/fragments that are fetched from the server schema, but it is used inside a client-only selection.")]
    InvalidServerOnlyDirectiveInClientFields(StringKey),

    #[error("@{connection_directive_name} used on invalid field '{connection_field_name}'. Expected the return type to be a non-plural interface or object, got '{connection_type_string}'.")]
    InvalidConnectionFieldType {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        connection_type_string: String,
    },

    #[error("Expected field '{connection_field_name}' to have a '{first_arg}' or '{last_arg}' argument.")]
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

    #[error("@{connection_directive_name} used on invalid field '{connection_field_name}'. Expected the field type '{connection_type_name}' to expose a '{edges_selection_name}' field that returns a list of objects.")]
    ExpectedConnectionToExposeValidEdgesField {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        connection_type_name: StringKey,
        edges_selection_name: StringKey,
    },

    #[error("@{connection_directive_name} used on invalid field '{connection_field_name}'. Expected the field type '{connection_type_name}' to expose a '{edges_selection_name} {{ {node_selection_name} }}' field that returns an object, interface or union.")]
    ExpectedConnectionToExposeValidNodeField {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        connection_type_name: StringKey,
        edges_selection_name: StringKey,
        node_selection_name: StringKey,
    },

    #[error("@{connection_directive_name} used on invalid field '{connection_field_name}'. Expected the field type '{connection_type_name}' to expose a '{edges_selection_name} {{ {cursor_selection_name} }}' field that returns a scalar.")]
    ExpectedConnectionToExposeValidCursorField {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        connection_type_name: StringKey,
        cursor_selection_name: StringKey,
        edges_selection_name: StringKey,
    },

    #[error("@{connection_directive_name} used on invalid field '{connection_field_name}'. Expected the field type '{connection_type_name}' to expose a '{page_info_selection_name}' field that returns an object.")]
    ExpectedConnectionToExposeValidPageInfoField {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        connection_type_name: StringKey,
        page_info_selection_name: StringKey,
    },

    #[error("@{connection_directive_name} used on invalid field '{connection_field_name}'. Expected the field type '{connection_type_name}' to expose a '{page_info_selection_name} {{ {page_info_sub_field_name} }}' field that returns a scalar.")]
    ExpectedConnectionToExposeValidPageInfoSubField {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        connection_type_name: StringKey,
        page_info_selection_name: StringKey,
        page_info_sub_field_name: StringKey,
    },

    #[error("Expected the {handler_arg_name} argument to @{connection_directive_name} to be a string literal for field '{connection_field_name}'.")]
    InvalidConnectionHandlerArg {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        handler_arg_name: StringKey,
    },

    #[error("Expected the {key_arg_name} argument to @{connection_directive_name} to be a string literal for field '{connection_field_name}'.")]
    InvalidConnectionKeyArg {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        key_arg_name: StringKey,
    },

    #[error("Expected the {dynamic_key_arg_name} argument to @{connection_directive_name} to be a variable for field '{connection_field_name}'.")]
    InvalidConnectionDynamicKeyArg {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        dynamic_key_arg_name: StringKey,
    },

    #[error("Expected the {key_arg_name} argument to @{connection_directive_name} to be of form '<SomeName>_{postfix}', got '{key_arg_value}'. For a detailed explanation, check out https://relay.dev/docs/en/pagination-container#connection")]
    InvalidConnectionKeyArgPostfix {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        key_arg_name: StringKey,
        key_arg_value: StringKey,
        postfix: String,
    },

    #[error("Expected the {filters_arg_name} argument to @{connection_directive_name} to be a list of string literals for field '{connection_field_name}'.")]
    InvalidConnectionFiltersArg {
        connection_directive_name: StringKey,
        connection_field_name: StringKey,
        filters_arg_name: StringKey,
    },

    #[error("Expected the `{0}` argument to @relay to be a boolean literal if specified.")]
    InvalidRelayDirectiveArg(StringKey),
    #[error("Cannot use @relay(mask: false) on fragment spreads for fragments with directives.")]
    InvalidUnmaskOnFragmentWithDirectives(),
    #[error("Cannot use @relay(mask: false) on fragment spreads for fragments with @argumentDefinitions.")]
    InvalidUnmaskOnFragmentWithArguments(),
    #[error("Cannot combine global and local variables when applying @relay(mask: false")]
    InvalidUnmaskOnLocalAndGloablVariablesWithSameName(),
    #[error("Cannot combine variables with incompatible types {prev_arg_type} and {next_arg_type} when applying @relay(mask: false")]
    InvalidUnmaskOnVariablesOfIncompatibleTypesWithSameName {
        prev_arg_type: String,
        next_arg_type: String,
    },

    #[error("Found a circular reference from fragment '{fragment_name}'.")]
    CircularFragmentReference { fragment_name: StringKey },

    #[error("'{name}' should be defined on the server schema.")]
    MissingServerSchemaDefinition { name: StringKey },

    #[error("Direct use of the '{field_name}' field is not allowed, use '@match/@module instead.")]
    InvalidDirectUseOfJSField { field_name: StringKey },
    #[error("Expected the 'key' argument of @match to be a literal string starting with the document name, e.g. '{document_name}_<localName>'.")]
    InvalidMatchKeyArgument { document_name: StringKey },
    #[error("@match used on incompatible field '{field_name}'. @match may only be used with fields that accept a 'supported: [String]' argument.")]
    InvalidMatchNotOnNonNullListString { field_name: StringKey },
    #[error("@match used on incompatible field '{field_name}'. @match may only be used with fields that return a union or interface.")]
    InvalidMatchNotOnUnionOrInterface { field_name: StringKey },
    #[error("Invalid @match selection: the '{supported_arg}' argument is automatically added and cannot be supplied explicitly.'")]
    InvalidMatchNoUserSuppliedSupportedArg { supported_arg: StringKey },
    #[error("Invalid @match selection: all selections should be fragment spreads with @module.")]
    InvalidMatchNotAllSelectionsFragmentSpreadWithModule,
    #[error("Invalid @match selection: expected at least one @module selection. Remove @match or add a '...Fragment @module()' selection.")]
    InvalidMatchNoModuleSelection,

    #[error("@module does not support @arguments.")]
    InvalidModuleWithArguments,
    #[error("Using @module requires the schema to define a scalar '{js_field_type}' type.")]
    InvalidModuleNonScalarJSField { js_field_type: StringKey },
    #[error("@module used on invalid fragment spread '...{spread_name}'. @module may only be used with fragments on a concrete (object) type, but the fragment has abstract type '{type_string}'.")]
    InvalidModuleNotOnObject {
        spread_name: StringKey,
        type_string: StringKey,
    },
    #[error("@module used on invalid fragment spread '...{spread_name}'. @module requires the fragment type '{type_string}' to have a '{js_field_name}({js_field_module_arg}: String!, {js_field_id_arg}: String): {js_field_type}' field (your schema may choose to omit the 'id'  argument but if present it must accept a 'String').")]
    InvalidModuleInvalidSchemaArguments {
        spread_name: StringKey,
        type_string: StringKey,
        js_field_name: StringKey,
        js_field_module_arg: StringKey,
        js_field_id_arg: StringKey,
        js_field_type: StringKey,
    },
    #[error("@module used on invalid fragment spread '...{spread_name}'. @module may not have additional directives.")]
    InvalidModuleWithAdditionalDirectives { spread_name: StringKey },
    #[error("Expected the 'name' argument of @module to be a literal string.")]
    InvalidModuleNonLiteralName,
    #[error("Expected the 'name' argument to be defined.")]
    InvalidModuleNoName,
    #[error("Invalid @module selection: documents with multiple fields containing 3D selections must specify a unique 'key' value for each field: use '{parent_name} @match(key: \"{document_name}_<localName>\")'.")]
    InvalidModuleSelectionWithoutKey {
        document_name: StringKey,
        parent_name: StringKey,
    },
    #[error("Invalid @module selection: concrete type '{type_name}' was matched multiple times at path '{alias_path}' but with a different fragment or module name.")]
    InvalidModuleSelectionMultipleMatches {
        type_name: StringKey,
        alias_path: String,
    },
    #[error("Found conflicting @module selections: use a unique alias on the parent fields")]
    ConflictingModuleSelections,

    #[error("Invalid use of @{directive_name}, the provided label is not unique. Specify a unique 'label' as a literal string.")]
    LabelNotUniqueForDeferStream { directive_name: StringKey },
    #[error(
        "Expected the '{arg_name}' value to @{directive_name} to be a string literal if provided."
    )]
    LiteralStringArgumentExpectedForDirective {
        arg_name: StringKey,
        directive_name: StringKey,
    },
    #[error("Invalid use of @defer on an inline fragment, @defer is only supported on fragment spreads.")]
    InvalidDeferOnInlineFragment,

    #[error("Invalid use of @stream on scalar field '{field_name}'")]
    InvalidStreamOnScalarField { field_name: StringKey },

    #[error("Invalid use of @stream, the 'initial_count' argument is required.")]
    StreamInitialCountRequired,
}
