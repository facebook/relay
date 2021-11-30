/*
 * Copyright (c) Facebook, Inc. and its affiliates.
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

    #[error(
        "{pluralized_string} in graphql tags must start with the module name ('{module_name}') and end with '{operation_type_suffix}'. Got '{operation_name}' instead."
    )]
    InvalidOperationName {
        pluralized_string: String,
        module_name: String,
        operation_type_suffix: String,
        operation_name: String,
    },

    #[error(
        "Fragments in graphql tags must start with the module name ('{module_name}'). Got '{fragment_name}' instead."
    )]
    InvalidFragmentName {
        module_name: String,
        fragment_name: String,
    },

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

    #[error("Found a circular reference from fragment '{fragment_name}'.")]
    CircularFragmentReference { fragment_name: StringKey },

    #[error("'{name}' should be defined on the server schema.")]
    MissingServerSchemaDefinition { name: StringKey },

    #[error("Direct use of the '{field_name}' field is not allowed, use '@match/@module instead.")]
    InvalidDirectUseOfJSField { field_name: StringKey },

    #[error(
        "Expected the 'key' argument of @match to be a literal string starting with the document name, e.g. '{document_name}_<localName>'."
    )]
    InvalidMatchKeyArgument { document_name: StringKey },

    #[error(
        "@match used on incompatible field '{field_name}'. @match may only be used with fields that accept a 'supported: [String]' argument."
    )]
    InvalidMatchNotOnNonNullListString { field_name: StringKey },

    #[error(
        "@match used on incompatible field '{field_name}'. @match may only be used with fields that return a union or interface."
    )]
    InvalidMatchNotOnUnionOrInterface { field_name: StringKey },

    #[error(
        "Invalid @match selection: the '{supported_arg}' argument is automatically added and cannot be supplied explicitly.'"
    )]
    InvalidMatchNoUserSuppliedSupportedArg { supported_arg: StringKey },

    #[error("Invalid @match selection: all selections should be fragment spreads with @module.")]
    InvalidMatchNotAllSelectionsFragmentSpreadWithModule,

    #[error(
        "Invalid @match selection: expected at least one @module selection. Remove @match or add a '...Fragment @module()' selection."
    )]
    InvalidMatchNoModuleSelection,

    #[error(
        "@match on a field without the `supported` argument is a no-op, please remove the `@match`."
    )]
    InvalidMatchWithNoSupportedArgument,

    #[error("@module does not support @inline fragments.")]
    InvalidModuleWithInline,

    #[error("@module does not support @arguments.")]
    InvalidModuleWithArguments,

    #[error("Using @module requires the schema to define a scalar '{js_field_type}' type.")]
    InvalidModuleNonScalarJSField { js_field_type: StringKey },

    #[error(
        "@module used on invalid fragment spread '...{spread_name}'. @module may only be used with fragments on a concrete (object) type, but the fragment has abstract type '{type_string}'."
    )]
    InvalidModuleNotOnObject {
        spread_name: StringKey,
        type_string: StringKey,
    },

    #[error(
        "@module used on invalid fragment spread '...{spread_name}'. @module requires the fragment type '{type_string}' to have a '{js_field_name}({js_field_module_arg}: String!, {js_field_id_arg}: String): {js_field_type}' field (your schema may choose to omit the 'id'  argument but if present it must accept a 'String')."
    )]
    InvalidModuleInvalidSchemaArguments {
        spread_name: StringKey,
        type_string: StringKey,
        js_field_name: StringKey,
        js_field_module_arg: StringKey,
        js_field_id_arg: StringKey,
        js_field_type: StringKey,
    },

    #[error(
        "@module used on invalid fragment spread '...{spread_name}'. @module may not have additional directives."
    )]
    InvalidModuleWithAdditionalDirectives { spread_name: StringKey },

    #[error("Expected the 'name' argument of @module to be a literal string.")]
    InvalidModuleNonLiteralName,

    #[error("Expected the 'name' argument to be defined.")]
    InvalidModuleNoName,

    #[error(
        "Invalid @module selection: documents with multiple fields containing 3D selections must specify a unique 'key' value for each field: use '{parent_name} @match(key: \"{document_name}_<localName>\")'."
    )]
    InvalidModuleSelectionWithoutKey {
        document_name: StringKey,
        parent_name: StringKey,
    },

    #[error(
        "Invalid @module selection: concrete type '{type_name}' was matched multiple times at path '{alias_path}' but with a different fragment or module name."
    )]
    InvalidModuleSelectionMultipleMatches {
        type_name: StringKey,
        alias_path: String,
    },

    #[error(
        "Each field on a given type can have only a single @module directive, but here there is more than one (perhaps within different spreads). To fix it, put each @module directive into its own aliased copy of the field with different aliases."
    )]
    ConflictingModuleSelections,

    #[error(
        "Invalid use of @{directive_name}, the provided label is not unique. Specify a unique 'label' as a literal string."
    )]
    LabelNotUniqueForDeferStream { directive_name: StringKey },

    #[error(
        "Expected the '{arg_name}' value to @{directive_name} to be a string literal if provided."
    )]
    LiteralStringArgumentExpectedForDirective {
        arg_name: StringKey,
        directive_name: StringKey,
    },

    #[error(
        "Invalid use of @defer on an inline fragment. Relay only supports @defer on fragment spreads."
    )]
    InvalidDeferOnInlineFragment,

    #[error("Invalid use of @stream on scalar field '{field_name}'")]
    InvalidStreamOnScalarField { field_name: StringKey },

    #[error("Invalid use of @stream, the 'initial_count' argument is required.")]
    StreamInitialCountRequired,

    #[error("Field '{field_name}' is not of list type, therefore cannot use @stream directive.")]
    StreamFieldIsNotAList { field_name: StringKey },

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

    #[error(
        "Expected the 'queryName' argument of @refetchable to be a string, got '{query_name_value}"
    )]
    ExpectQueryNameToBeString { query_name_value: String },

    #[error(
        "Duplicate definition for @refetchable operation '{query_name}' from fragments '{first_fragment_name}' and '{second_fragment_name}'"
    )]
    DuplicateRefetchableOperation {
        query_name: StringKey,
        first_fragment_name: StringKey,
        second_fragment_name: StringKey,
    },

    #[error(
        r#"When provided, the `directives` argument to `@refetchable` needs to be a list of literal strings. Each string should be a server directive valid on queries. Example: `@refetchable(queryName: "ExampleQuery", directives: ["@owner(name: \"an owner\")"])"#
    )]
    RefetchableDirectivesArgRequiresLiteralStringList,

    #[error(
        "Invalid use of @refetchable on fragment '{fragment_name}', only supported are fragments on:\n{descriptions}"
    )]
    UnsupportedRefetchableFragment {
        fragment_name: StringKey,
        descriptions: String,
    },

    #[error(
        "A unique query name has to be specified in `@refetchable`, an operation `{query_name}` already exists."
    )]
    RefetchableQueryConflictWithQuery { query_name: StringKey },

    #[error(
        "Invalid use of @refetchable on fragment `{fragment_name}`, this fragment already has an `$id` variable in scope."
    )]
    RefetchableFragmentOnNodeWithExistingID { fragment_name: StringKey },

    #[error(
        "Invalid use of @refetchable on fragment `{fragment_name}`, fragments cannot be annotated with both @refetchable and @relay(plural: true)."
    )]
    InvalidRefetchableFragmentWithRelayPlural { fragment_name: StringKey },

    #[error(
        "Invalid use of @refetchable on fragment '{fragment_name}', check that your schema defines a `Node {{ id: ID }}` interface and has a `node(id: ID): Node` field on the query type (the id argument may also be non-null)."
    )]
    InvalidNodeSchemaForRefetchableFragmentOnNode { fragment_name: StringKey },

    #[error(
        "Invalid use of @refetchable on fragment '{fragment_name}', check that your schema defines a 'Viewer' object type and has a 'viewer: Viewer' field on the query type."
    )]
    InvalidViewerSchemaForRefetchableFragmentOnViewer { fragment_name: StringKey },

    #[error(
        "Invalid use of @refetchable with @connection in fragment '{fragment_name}', at most once @connection can appear in a refetchable fragment."
    )]
    RefetchableWithMultipleConnections { fragment_name: StringKey },

    #[error(
        "Invalid use of @refetchable with @connection in fragment '{fragment_name}', refetchable connections cannot appear inside plural fields."
    )]
    RefetchableWithConnectionInPlural { fragment_name: StringKey },

    #[error(
        "Invalid use of @refetchable with @connection in fragment '{fragment_name}', refetchable connections must use variables for the {arguments} arguments."
    )]
    RefetchableWithConstConnectionArguments {
        fragment_name: StringKey,
        arguments: &'static str,
    },

    #[error(
        "Invalid use of @refetchable with @connection in fragment '{fragment_name}', check that your schema defines a `directive @fetchable(field_name: String!) on OBJECT`."
    )]
    InvalidRefetchDirectiveDefinition { fragment_name: StringKey },

    #[error(
        "Invalid use of @refetchable on fragment '{fragment_name}', the type '{type_name}' is @fetchable but the identifying field '{identifier_field_name}' does not have type 'ID'."
    )]
    InvalidRefetchIdentifyingField {
        fragment_name: StringKey,
        identifier_field_name: StringKey,
        type_name: StringKey,
    },

    #[error(
        "Invalid use of @refetchable on fragment '{fragment_name}', the type '{type_name}' is @fetchable but there is no corresponding '{fetch_field_name}' field or it is invalid (expected '{fetch_field_name}(id: ID!): ${type_name}')."
    )]
    InvalidRefetchFetchField {
        fetch_field_name: StringKey,
        fragment_name: StringKey,
        type_name: StringKey,
    },

    #[error("Variables are not yet supported inside @inline fragments.")]
    InlineDataFragmentArgumentsNotSupported,

    #[error("Directives on fragment spreads for @inline fragments are not yet supported")]
    InlineDataFragmentDirectivesNotSupported,

    #[error("Subscription '{subscription_name}' must have a single selection")]
    GenerateSubscriptionNameSingleSelectionItem { subscription_name: StringKey },

    #[error("The root of subscription '{subscription_name}' must be a simple selection.")]
    GenerateSubscriptionNameSimpleSelection { subscription_name: StringKey },

    #[error(
        "Live query expects 'polling_interval' or 'config_id' as an argument to @live_query to for root field {query_name}"
    )]
    LiveQueryTransformMissingConfig { query_name: StringKey },

    #[error(
        "Expected the 'polling_interval' argument to @live_query to be a literal number for root field {query_name}"
    )]
    LiveQueryTransformInvalidPollingInterval { query_name: StringKey },

    #[error(
        "Expected the 'config_id' argument to @live_query to be a literal string for root field {query_name}"
    )]
    LiveQueryTransformInvalidConfigId { query_name: StringKey },

    #[error("The directive `@{name}` can only be used once at this location.")]
    RepeatedNonRepeatableDirective { name: StringKey },

    #[error("Invalid use of @{directive_name} on scalar field '{field_name}'.")]
    ConnectionMutationDirectiveOnScalarField {
        directive_name: StringKey,
        field_name: StringKey,
    },

    #[error(
        "Invalid use of @{directive_name} on field '{field_name}'. Expected field type 'ID', got '{current_type}'."
    )]
    DeleteRecordDirectiveOnUnsupportedType {
        directive_name: StringKey,
        field_name: StringKey,
        current_type: String,
    },

    #[error("Invalid use of @{directive_name} on linked field '{field_name}'.")]
    DeleteRecordDirectiveOnLinkedField {
        directive_name: StringKey,
        field_name: StringKey,
    },

    #[error("Expected the 'connections' argument to be defined on @{directive_name}.")]
    ConnectionsArgumentRequired { directive_name: StringKey },

    #[error(
        "Unsupported use of @{directive_name} on field '{field_name}', expected an edge field (a field with 'cursor' and 'node' selection)."
    )]
    EdgeDirectiveOnUnsupportedType {
        directive_name: StringKey,
        field_name: StringKey,
    },

    #[error(
        "Invalid use of @{edge_directive_name} and @{node_directive_name} on field '{field_name}' - these directives cannot be used together."
    )]
    ConflictingEdgeAndNodeDirectives {
        edge_directive_name: StringKey,
        node_directive_name: StringKey,
        field_name: StringKey,
    },

    #[error(
        "Unsupported use of @{directive_name} on field '${field_name}', 'edgeTypeName' argument must be provided."
    )]
    NodeDirectiveMissesRequiredEdgeTypeName {
        directive_name: StringKey,
        field_name: StringKey,
    },

    #[error(
        "Unsupported use of @{directive_name} on field '{field_name}'. Expected an object, union or interface, but got '{current_type}'."
    )]
    NodeDirectiveOnUnsupportedType {
        directive_name: StringKey,
        field_name: StringKey,
        current_type: String,
    },

    #[error(
        "Expected 'flight' field schema definition to specify its component name with @react_flight_component"
    )]
    InvalidFlightFieldMissingModuleDirective,

    #[error("Cannot query field '{field_name}', this type does not define a 'flight' field")]
    InvalidFlightFieldNotDefinedOnType { field_name: StringKey },

    #[error("Expected @react_flight_component value to be a literal string")]
    InvalidFlightFieldExpectedModuleNameString,

    #[error("Expected flight field to have a 'props: ReactFlightProps' argument")]
    InvalidFlightFieldPropsArgument,

    #[error("Expected flight field to have a 'component: String' argument")]
    InvalidFlightFieldComponentArgument,

    #[error("Expected flight field to return 'ReactFlightComponent'")]
    InvalidFlightFieldReturnType,

    #[error(
        "Unexpected @required within inline fragment on an abstract type. At runtime we cannot know if this field is null, or if it's missing because the inline fragment did not match"
    )]
    RequiredWithinAbstractInlineFragment,

    #[error("@required is not supported within @inline fragments.")]
    RequiredWithinInlineDirective,

    #[error("Missing `action` argument. @required expects an `action` argument")]
    RequiredActionArgumentRequired,

    #[error("Expected `action` argument to be a literal")]
    RequiredActionArgumentConstant,

    #[error("Expected `action` argument to be one of `NONE`, `LOG` or `THROW`")]
    RequiredActionArgumentEnum,

    #[error(
        "All references to a @required field must have matching `action` arguments. The `action` used for '{field_name}'"
    )]
    RequiredActionMismatch { field_name: StringKey },

    #[error(
        "All references to a field must have matching @required declarations. The field '{field_name}` is @required here"
    )]
    RequiredFieldMismatch { field_name: StringKey },

    #[error(
        "@required fields must be included in all instances of their parent. The field '{field_name}` is marked as @required here"
    )]
    RequiredFieldMissing { field_name: StringKey },

    #[error(
        "A @required field may not have an `action` less severe than that of its @required parent. This @required directive should probably have `action: {suggested_action}`"
    )]
    RequiredFieldInvalidNesting { suggested_action: StringKey },

    #[error(
        "The @required directive is experimental and not yet supported for use in product code"
    )]
    RequiredNotSupported,

    #[error("Module-provided variable ('{argument_name}') may not declare a default value")]
    ProvidedVariableIncompatibleWithDefaultValue { argument_name: StringKey },

    #[error(
        "Fragment variable `${name}` conflicts with a global variable generated by the @refetchable generated query"
    )]
    LocalGlobalVariableConflict { name: StringKey },

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

    // Updatable queries and fragments
    #[error("The @updatable directive is yet allowed on fragments.")]
    UpdatableNotAllowedOnFragments,

    #[error(
        "The @{disallowed_directive_name} directive is not allowed in updatable {outer_type_plural}."
    )]
    UpdatableDisallowOtherDirectives {
        disallowed_directive_name: StringKey,
        outer_type_plural: &'static str,
    },

    #[error(
        "Only fragments decorated with the @assignable directive can be spread within updatable {outer_type_plural}. You can try adding the @assignable directive to the fragment {fragment_name}."
    )]
    UpdatableOnlyAssignableFragmentSpreads {
        outer_type_plural: &'static str,
        fragment_name: StringKey,
    },

    #[error(
        "Within updatable {outer_type_plural}, if an assignable fragment is spread on a linked field, the fragment's type (`{fragment_type}`) must be equal to or a subtype of the field's type (`{field_type}`)."
    )]
    UpdatableSpreadOfAssignableFragmentMustBeEqualToOrSubtypeOfOuterField {
        outer_type_plural: &'static str,
        fragment_type: StringKey,
        field_type: StringKey,
    },

    // Note: conditions do not have a location, hence this awkward phrasing
    #[error(
        "Within updatable {outer_type_plural}, the directives @include and @skip are not allowed. The directive was found in {operation_or_fragment_name}."
    )]
    UpdatableNoConditions {
        outer_type_plural: &'static str,
        operation_or_fragment_name: StringKey,
    },

    #[error(
        "Within updatable {outer_type_plural}, if a linked field contains an inline fragment spread, it must contain only inline fragment spreads."
    )]
    UpdatableOnlyInlineFragments { outer_type_plural: &'static str },

    #[error(
        "Within updatable {outer_type_plural}, inline fragments are only allowed on interfaces or unions, not on concrete types. In updatable queries, each inline fragment must have a type conditions, so no inline fragment would make sense here."
    )]
    UpdatableInlineFragmentsOnlyOnInterfacesOrUnions { outer_type_plural: &'static str },

    #[error(
        "Within updatable {outer_type_plural}, each inline fragment spread must have a type condition. An inline fragment without a type condition was among the selections of {parent_field_type}."
    )]
    UpdatableInlineFragmentsRequireTypeConditions {
        outer_type_plural: &'static str,
        parent_field_type: StringKey,
    },

    #[error(
        "Within updatable {outer_type_plural}, each inline fragment spread must have a type condition narrowing the type to a unique concrete type. `{type_condition}` is not a concrete type."
    )]
    UpdatableInlineFragmentsTypeConditionsMustBeConcrete {
        outer_type_plural: &'static str,
        type_condition: StringKey,
    },

    #[error(
        "Within updatable {outer_type_plural}, a single linked field cannot have multiple inline fragments with the same type condition. However, within {parent_field_alias_or_name}, there were multiple inline fragments narrowing the type to `{type_condition}`."
    )]
    UpdatablePreviouslyEncounteredTypeCondition {
        outer_type_plural: &'static str,
        type_condition: StringKey,
        parent_field_alias_or_name: StringKey,
    },

    #[error(
        "Within updatable {outer_type_plural}, each inline fragment spread must contain an unaliased typename field. However, within {parent_field_alias_or_name}, there are inline fragments without typename fields."
    )]
    UpdatableInlineFragmentsMustHaveTypenameFields {
        outer_type_plural: &'static str,
        parent_field_alias_or_name: StringKey,
    },

    #[error(
        "Within updatable {outer_type_plural}, an inline fragment cannot occur immediately within another inline fragment. Found within {operation_or_fragment_name}. This is because all inline fragments must have type conditions and narrow the type from an abstract type to a concrete type."
    )]
    UpdatableNoNestedInlineFragments {
        outer_type_plural: &'static str,
        operation_or_fragment_name: StringKey,
    },

    // Assignable fragments
    #[error(
        "Assignable fragments should contain only a single, unaliased __typename field with no directives."
    )]
    AssignableOnlyUnaliasedTypenameFieldWithNoDirectives,

    #[error("The @{disallowed_directive_name} directive is not allowed on assignable fragments.")]
    AssignableDisallowOtherDirectives {
        disallowed_directive_name: StringKey,
    },

    #[error("No fields can have an alias that start with two underscores.")]
    NoDoubleUnderscoreAlias,

    #[error("Top-level spreads of assignable fragments are not supported.")]
    AssignableNoTopLevelFragmentSpreads,

    #[error(
        "The @{disallowed_directive_name} directive is not allowed on assignable fragment spreads."
    )]
    AssignableFragmentSpreadNoOtherDirectives {
        disallowed_directive_name: StringKey,
    },

    #[error("Assignable fragments cannot appear within inline fragments")]
    AssignableFragmentSpreadNotWithinInlineFragment,
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
