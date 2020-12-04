/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_syntax::OperationKind;
use interner::StringKey;
use schema::{Type, TypeReference};
use thiserror::Error;

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
    #[error("The type `{type_}` has no field `{field}`")]
    UnknownField { type_: StringKey, field: StringKey },
    #[error("Expected no selections on scalar field `{field_name}` of type `{type_name}`")]
    InvalidSelectionsOnScalarField {
        field_name: StringKey,
        type_name: StringKey,
    },
    #[error("Expected selections on field `{field_name}` of type `{type_name}`")]
    ExpectedSelectionsOnObjectField {
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
        "Expected @argumentDefinitions value to have a 'type' field with a literal string value (e.g. 'type: \"Int!\"')"
    )]
    ExpectedArgumentDefinitionLiteralType(),
    #[error(
        "Expected @argumentDefinitions value to be an object with 'type' and (optionally) 'defaultValue' properties"
    )]
    ExpectedArgumentDefinitionToBeObject(),
    #[error("Expected '@argumentDefinitions' directive to be used on fragment definitions only.")]
    ExpectedArgumentDefinitionsDirectiveOnFragmentDefinition(),
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
        parent_type: String,
        type_condition: String,
    },
    #[error(
        "Invalid fragment spread '{fragment_name}', the type of this fragment ('{type_condition}') can never occur for parent type '{parent_type}'"
    )]
    InvalidFragmentSpreadType {
        fragment_name: StringKey,
        parent_type: String,
        type_condition: String,
    },
    #[error("Directive '{0}' not supported in this location")]
    InvalidDirectiveUsageUnsupportedLocation(StringKey),

    #[error(
        "Invalid values passed to '@arguments', supported options include 'type' and 'defaultValue', got '{0}'"
    )]
    InvalidArgumentsKeys(String),

    #[error("Unexpected arguments on `__typename` field")]
    InvalidArgumentsOnTypenameField(),

    #[error("Unexpected arguments on '__token' field")]
    InvalidArgumentsOnFetchTokenField(),

    #[error(
        "Relay does not allow aliasing fields to `id`. This name is reserved for the globally unique `id` field on `Node`."
    )]
    DisallowIdAsAliasError(),

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
    #[error("Found conflicting @module selections: use a unique alias on the parent fields")]
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
        "Invalid use of @defer on an inline fragment, @defer is only supported on fragment spreads."
    )]
    InvalidDeferOnInlineFragment,

    #[error("Invalid use of @stream on scalar field '{field_name}'")]
    InvalidStreamOnScalarField { field_name: StringKey },

    #[error("Invalid use of @stream, the 'initial_count' argument is required.")]
    StreamInitialCountRequired,

    #[error("Variable `${variable_name}` is never used in operation `{operation_name}`")]
    UnusedVariable {
        variable_name: StringKey,
        operation_name: StringKey,
    },

    #[error(
        "Invalid usage of '@DEPRECATED__relay_ignore_unused_variables_error'. No unused variables found in the query '{operation_name}'."
    )]
    UnusedIgnoreUnusedVariablesDirective { operation_name: StringKey },

    #[error("Operation '{operation_name}' references undefined variable{variables_string}.")]
    GlobalVariables {
        operation_name: StringKey,
        variables_string: String,
    },

    #[error("Expected the 'queryName' argument of @refetchable to be provided")]
    QueryNameRequired,

    #[error(
        "Expected the 'queryName' argument of @refetchable to be a string, got '{query_name_value}"
    )]
    ExpectQueryNameToBeString { query_name_value: String },

    #[error(
        "Duplicate definition for @refetchable operation '{query_name}' from fragments '{fragment_name}' and '{previous_fragment_name}'"
    )]
    DuplicateRefetchableOperation {
        query_name: StringKey,
        fragment_name: StringKey,
        previous_fragment_name: StringKey,
    },

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

    #[error("A relay_early_flush field should be defined on Query on the server schema.")]
    UnavailableRelayEarlyFlushServerSchema,

    #[error(
        "Expected the {query_name} argument to exist in relay_early_flush on the server schema."
    )]
    RelayEarlyFlushSchemaWithoutQueryNameArg { query_name: StringKey },

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
        "Expected all fields on the same parent with the name or alias `{field_name}` to have the same argument values after appling fragment arguments. This field has the applied argument values: {arguments_a}"
    )]
    InvalidSameFieldWithDifferentArguments {
        field_name: StringKey,
        arguments_a: String,
    },

    #[error(
        "Unexpected @required within inline fragment on an abstract type. At runtime we cannot know if this field is null, or if it's missing beacuse the inline fragment did not match"
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

    #[error(
        "Fragment variable `${name}` conflicts with a global variable generated by the @refetchable generated query"
    )]
    LocalGlobalVariableConflict { name: StringKey },

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
}
