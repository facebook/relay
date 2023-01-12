/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::ArgumentName;
use common::DiagnosticDisplay;
use common::DirectiveName;
use common::InterfaceName;
use common::ObjectName;
use common::WithDiagnosticData;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::VariableName;
use intern::string_key::StringKey;
use intern::Lookup;
use thiserror::Error;

#[derive(Clone, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ValidationMessage {
    #[error("@relay_client_component is not compatible with these {}: `{}`",
         if incompatible_directives.len() > 1 { "directives" } else { "directive" },
         incompatible_directives
             .iter()
             .map(|name| name.0.lookup())
             .collect::<Vec<_>>()
             .join("`, `"))
     ]
    IncompatibleRelayClientComponentDirectives {
        incompatible_directives: Vec<DirectiveName>,
    },

    #[error("@relay_client_component is not compatible with @arguments.")]
    InvalidRelayClientComponentWithArguments,

    #[error("This fragment spread already has a split normalization file generated.")]
    DuplicateRelayClientComponentSplitOperation,

    #[error(
        "@relay_client_component can only be used on fragments on Viewer or Query, or whose type implements the Node interface. If the fragment's type is a union type, all members of that union must implement Node."
    )]
    InvalidRelayClientComponentNonNodeFragment,

    #[error(
        "The Relay Resolver backing this field has an `@relay_resolver` directive with an invalid '{key}' argument. Expected a literal string value."
    )]
    InvalidRelayResolverKeyArg { key: ArgumentName },

    #[error(
        "The Relay Resolver backing this field is missing a '{key}' argument in its `@relay_resolver` directive."
    )]
    MissingRelayResolverKeyArg { key: ArgumentName },

    #[error(
        "Unexpected directive on Relay Resolver field. Relay Resolver fields do not currently support directives."
    )]
    RelayResolverUnexpectedDirective,

    #[error(
        "The Relay Resolver backing this field is defined with an invalid `fragment_name`. Could not find a fragment named '{fragment_name}'."
    )]
    InvalidRelayResolverFragmentName {
        fragment_name: FragmentDefinitionName,
    },
    #[error(
        "The usage of global variable `${variable_name}` is not supported in the Relay resolvers fragments. Please, add this variable to the `@argumentDefinitions` of the `{fragment_name}` fragment."
    )]
    UnsupportedGlobalVariablesInResolverFragment {
        variable_name: VariableName,
        fragment_name: FragmentDefinitionName,
    },

    #[error(
        "Field with actor change (@as_actor) directive expected to have only one item in its selection, and it should be a fragment spread."
    )]
    ActorChangeInvalidSelection,

    #[error("Actor change directive (@as_actor) cannot be applied to scalar fields.")]
    ActorChangeCannotUseOnScalarFields,

    #[error(
        "Actor change has limited (experimental) support and is not allowed to use on this fragment spread."
    )]
    ActorChangeIsExperimental,

    #[error("Actor change does not support plural fields, yet.")]
    ActorChangePluralFieldsNotSupported,

    #[error(
        "Unexpected Relay Resolver field. The Relay Resolvers feature flag is not currently enabled for this project."
    )]
    RelayResolversDisabled,

    #[error(
        "The directive '{directive_name}' automatically adds '{actor_change_field}' to the selection of the field '{field_name}'. But the field '{actor_change_field}' does not exist on the type '{type_name}'. Please makes sure the GraphQL schema supports actor change on '{type_name}'."
    )]
    ActorChangeExpectViewerFieldOnType {
        directive_name: DirectiveName,
        actor_change_field: StringKey,
        field_name: StringKey,
        type_name: StringKey,
    },

    #[error(
        "The directive '{directive_name}' automatically adds '{actor_change_field}' to the selection of the field '{field_name}'. The field '{actor_change_field}' should be defined as a scalar field in the GraphQL Schema, but is defined with the type '{actor_change_field_type}' instead."
    )]
    ActorChangeViewerShouldBeScalar {
        directive_name: DirectiveName,
        actor_change_field: StringKey,
        field_name: StringKey,
        actor_change_field_type: StringKey,
    },

    #[error(
        "The '{fragment_name}' is transformed to use @no_inline implictly by `@module` or `@relay_client_component`, but it's also used in a regular fragment spread. It's required to explicitly add `@no_inline` to the definition of '{fragment_name}'."
    )]
    RequiredExplicitNoInlineDirective {
        fragment_name: FragmentDefinitionName,
    },

    #[error(
        "The `@relay_test_operation` directive is only allowed within test \
        files because it creates larger generated files we don't want to \
        include in production. File does not match test regex: {test_path_regex}"
    )]
    TestOperationOutsideTestDirectory { test_path_regex: String },

    #[error("Undefined fragment '{0}'")]
    UndefinedFragment(FragmentDefinitionName),

    #[error(
        "Each field on a given type can have only a single @module directive, but here there is more than one (perhaps within different spreads). To fix it, put each @module directive into its own aliased copy of the field with different aliases."
    )]
    ConflictingModuleSelections,

    #[error(
        "Client Edges that reference client-defined interface types are not currently supported in Relay."
    )]
    ClientEdgeToClientInterface,

    #[error(
        "Client Edges that reference client-defined union types are not currently supported in Relay."
    )]
    ClientEdgeToClientUnion,

    #[error("Invalid directive combination. @alias may not be combined with other directives.")]
    FragmentAliasIncompatibleDirective,

    #[error("Unexpected directive @alias. @alias is not currently enabled in this location.")]
    FragmentAliasDirectiveDisabled,

    #[error("Expected the `as` argument of the @alias directive to be a static string.")]
    FragmentAliasDirectiveDynamicNameArg,

    #[error(
        "Missing required argument `as`. The `as` argument of the @alias directive is required on inline fragments without a type condition."
    )]
    FragmentAliasDirectiveMissingAs,

    #[error(
        "Unexpected dynamic argument. {field_name}'s '{argument_name}' argument must be a constant value because it is read by the Relay compiler."
    )]
    InvalidStaticArgument {
        field_name: StringKey,
        argument_name: ArgumentName,
    },

    #[error(
        "Unexpected directive on Client Edge field. The `@{directive_name}` directive is not currently supported on fields backed by Client Edges."
    )]
    ClientEdgeUnsupportedDirective { directive_name: DirectiveName },

    #[error(
        "Invalid @RelayResolver output type for field `{field_name}`. Got input object `{type_name}`."
    )]
    RelayResolverOutputTypeInvalidInputObjectType {
        field_name: StringKey,
        type_name: StringKey,
    },

    #[error(
        "@RelayResolver {type_kind} type `{type_name}` for field `{field_name}` is not supported as @outputType, yet."
    )]
    RelayResolverOutputTypeUnsupported {
        type_kind: StringKey,
        field_name: StringKey,
        type_name: StringKey,
    },

    #[error(
        "No types implement the client interface {interface_name}. For a client interface to be used as a @RelayResolver @outputType, at least one Object type must implement the interface."
    )]
    RelayResolverClientInterfaceMustBeImplemented { interface_name: InterfaceName },

    #[error(
        "The interface {interface_name} is being used as an @outputType of a @RelayResolver. For this to be valid, all Object types that implement the interface must be client types. However, the {object_name}, which implements {interface_name}, is a server type."
    )]
    RelayResolverClientInterfaceImplementingTypeMustBeClientTypes {
        interface_name: InterfaceName,
        object_name: ObjectName,
    },

    #[error(
        "@RelayResolver type recursion detected for the output type `{type_name}`. This is not supported for `@outputType` resolvers. If you want to model a connection between two entities of the same GraphQL type, consider creating a new Relay Resolver with `@edgeTo` annotation."
    )]
    RelayResolverTypeRecursionDetected { type_name: StringKey },

    #[error(
        "Field `{field_name}` has output type `{type_name}`. `{type_name}` is a server type, and server types cannot be used with @outputType on @RelayResolver. Edges to server types can be exposed with @edgeTo and @waterfall."
    )]
    RelayResolverServerTypeNotSupported {
        field_name: StringKey,
        type_name: StringKey,
    },

    #[error(
        "Field name `{id_name}` is reserved for strong objects (objects that implement Node interface). Defining `{id_name}` fields is not currently supported on @RelayResolver with @outputType."
    )]
    RelayResolverIDFieldNotSupported { id_name: StringKey },

    #[error(
        "Arguments are not supported in the fields on the @outputType in @RelayResolvers. You'll need to expose these fields using @RelayResolver for them."
    )]
    RelayResolverArgumentsNotSupported,

    #[error(
        "Disallowed selection of field `{}{field_name}`.{}",
        parent_name.map_or("".to_string(), |name| format!("{}.", name)),
        reason.map_or("".to_string(), |reason| format!(" Reason: \"{}\"", reason)),
    )]
    UnselectableField {
        field_name: StringKey,
        parent_name: Option<StringKey>,
        reason: Option<StringKey>,
    },
}

#[derive(Clone, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ValidationMessageWithData {
    #[error(
        "Expected a `@waterfall` directive on this field. Consuming a Client Edge field incurs a network roundtrip or \"waterfall\". To make this explicit, a `@waterfall` directive is required on this field."
    )]
    RelayResolversMissingWaterfall { field_name: StringKey },

    #[error(
        "Unexpected `@waterfall` directive. Only fields that are backed by a Client Edge and point to a server object should be annotated with the `@waterfall` directive."
    )]
    RelayResolversUnexpectedWaterfall,
}

impl WithDiagnosticData for ValidationMessageWithData {
    fn get_data(&self) -> Vec<Box<dyn DiagnosticDisplay>> {
        match self {
            ValidationMessageWithData::RelayResolversMissingWaterfall { field_name } => {
                vec![Box::new(format!("{} @waterfall", field_name,))]
            }
            ValidationMessageWithData::RelayResolversUnexpectedWaterfall => {
                vec![Box::new("")]
            }
        }
    }
}
