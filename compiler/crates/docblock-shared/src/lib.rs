/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod resolver_source_hash;

use common::ArgumentName;
use common::DirectiveName;
use common::ScalarName;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
pub use resolver_source_hash::ResolverSourceHash;

lazy_static! {
    /// Resolver fields and types get their schema definitions annotated with
    /// a directive using this name to signal to the rest of Relay that they are backed by
    /// Relay Resolvers. The arguments to this directive are used to know which
    /// features the resolver is using: e.g. if the resolver @live or @weak is used.
    pub static ref RELAY_RESOLVER_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("relay_resolver".intern());
    /// Relay supports a custom scalar type that resolvers may use as their return type. It
    /// indicates that Relay should derive the Flow/TypeScript type of the field from the
    /// return value of the resolver function. This allows resolvers to return
    /// arbitrary (non-serializable) JavaScript values as an escape hatch. This
    /// string is the name of that custom scalar as it appears in Relay's schema
    /// extensions `../../relay-schema/src/relay-extensions.graphql`.
    pub static ref RESOLVER_VALUE_SCALAR_NAME: ScalarName =
        ScalarName("RelayResolverValue".intern());
    /// The name of the docblock tag that Relay looks for to determine if a field is a resolver.
    /// @RelayResolver
    pub static ref RELAY_RESOLVER_FIELD: StringKey = "RelayResolver".intern();
    /// Resolvers let you define "model types" which are backed by a JS model value. These types in the schema
    /// are annotated with a directive using this name to signal to the rest of Relay that they are backed by
    /// a Relay Resolver model.
    pub static ref RELAY_RESOLVER_MODEL_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("__RelayResolverModel".intern());
    /// A field directive which indicates that the field is the generated ID field for a model type.
    pub static ref RELAY_RESOLVER_MODEL_GENERATED_ID_FIELD_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("__RelayResolverModelGeneratedIDField".intern());
    /// If a field or model type has a @relay_resolver directive (see above)
    /// this argument name is used to track its @rootFragment (if any).
    pub static ref FRAGMENT_KEY_ARGUMENT_NAME: ArgumentName =
        ArgumentName("fragment_name".intern());
    /// Indicates that the extraction mechanism used to derive this resolver's GraphQL type
    /// has validated that its Flow/TypeScript type matches the GraphQL type.
    pub static ref TYPE_CONFIRMED_ARGUMENT_NAME: ArgumentName =
        ArgumentName("type_confirmed".intern());
    /// Indicates that the resolver is just a property lookup on the underlying model (and we need to generate
    /// code to do this lookup)
    pub static ref RESOLVER_PROPERTY_LOOKUP_NAME: ArgumentName =
        ArgumentName("property_lookup_name".intern());
    /// "Weak" resolver types are types which are backed by a JS model value, but which don't have a stable
    /// identity. Types in the generated schema are annotated with a directive using this name to signal
    /// to the rest of Relay that they are backed by a "weak" Relay Resolver model.
    pub static ref RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE: DirectiveName =
        DirectiveName("__RelayWeakObject".intern());
    /// If a resolver field, or strong model resolver can change over time, the
    /// user can add a @live tag to its docblock. In that case, we'll set a
    /// argument in the `@relay_resolver` directive attached to that field or
    /// type. This name is that argument's name.
    pub static ref LIVE_ARGUMENT_NAME: ArgumentName = ArgumentName("live".intern());
    /// Relay codegen/typegen needs to know how to import a given resolver type
    /// or field. This name is the argument to the `@relay_resolver` directive
    /// attached to the schema definition for resolver types and fields that
    /// contains the name under which the type or function was exported.
    pub static ref IMPORT_NAME_ARGUMENT_NAME: ArgumentName =
    ArgumentName("import_name".intern());
    /// Argument name for the `@relay_resolver` directive attached to resolver's
    /// schema definition indicating if it had the @outputType docblock tag.
    pub static ref HAS_OUTPUT_TYPE_ARGUMENT_NAME: ArgumentName =
        ArgumentName("has_output_type".intern());
    /// Argument name for the `@relay_resolver` directive attached to resolver's
    /// schema definition containing the fragment name from the @returnFragment docblock tag.
    pub static ref RETURN_FRAGMENT_ARGUMENT_NAME: ArgumentName =
        ArgumentName("return_fragment".intern());
    /// Relay codegen/typegen needs to know how to import a given resolver type
    /// or field. This name is the argument to the `@relay_resolver` directive
    /// attached to the schema definition for resolver types and fields that
    /// contains the module from which the type or function was exported.
    pub static ref IMPORT_PATH_ARGUMENT_NAME: ArgumentName = ArgumentName("import_path".intern());
    /// Resolvers which define a strong type expect to get passed the parent
    /// object's `id` field. Field resolvers on model types expect to get passed
    /// the parent type's model instance (which is modeled in Relay as a field
    /// named `__relay_model_instance`, see below).
    ///
    /// This argument to the `@relay_resolver` directive specifies the field (if
    /// any) that the resolver expects to be passed, or have "injected".
    pub static ref INJECT_FRAGMENT_DATA_ARGUMENT_NAME: ArgumentName =
        ArgumentName("inject_fragment_data".intern());
    /// Resolvers that expect to be passed an id or model instance (see above)
    /// are currently implemented by generating a fragment that reads that field
    /// and then having the generated artifact that imports the user-defined
    /// resolver function apply a wrapper around that function which reads the
    /// field from the generated fragment and passes it to the user-defined resolver.
    /// If such a fragment is generated, this argument to the `@relay_resolver` directive
    /// is used to hold the name of the generated fragment.
    pub static ref GENERATED_FRAGMENT_ARGUMENT_NAME: ArgumentName =
        ArgumentName("generated_fragment".intern());
    /// _Legacy resolver syntax_: The name of the docblock tag used to indicate
    /// the name of the resolver field.
    pub static ref FIELD_NAME_FIELD: StringKey = "fieldName".intern();
    /// _Legacy resolver syntax_: The name of the docblock tag used to indicate
    /// the type on which the resolver field is being defined.
    pub static ref ON_TYPE_FIELD: StringKey = "onType".intern();
    /// _Legacy resolver syntax_: The name of the docblock tag used to indicate
    /// the interface on which the resolver field is being defined.
    pub static ref ON_INTERFACE_FIELD: StringKey = "onInterface".intern();
    /// _Legacy resolver syntax_: The name of the docblock tag used to indicate
    /// that a resolver returns an edge to another GraphQL type.
    pub static ref EDGE_TO_FIELD: StringKey = "edgeTo".intern();
    /// The name of the docblock tag used to indicate that a resolver is deprecated.
    /// If present, an equivalent `@deprecated` directive will be added to the
    /// resolver field. Note that GraphQL spec does not allow types to be marked
    /// as deprecated.
    pub static ref DEPRECATED_FIELD: StringKey = "deprecated".intern();
    /// The name of the docblock tag used to indicate that a resolver is "live", meaning it can
    /// change over time and thus returns a subscribable value.
    pub static ref LIVE_FIELD: StringKey = "live".intern();
    /// Directive used to annotate resolvers that are typed as being
    /// non-nullable. Part of Relay's experimental support for semantic
    /// nullability.
    ///
    /// See https://specs.apollo.dev/nullability/v0.2/#@semanticNonNull and
    /// https://grats.capt.dev/docs/guides/strict-semantic-nullability/ for more
    /// context.
    pub static ref SEMANTIC_NON_NULL_FIELD: StringKey = "semanticNonNull".intern();
    /// Resolver models are are JS values that back a resolver type. In the
    /// Relay runtime they are currently modeled as hidden fields on their
    /// parent type. This is the name of that field.
    ///
    /// Using a longer name version for this "special" field help us avoid
    /// potential collision with product code (__self, __instance can be used
    /// for something else)
    pub static ref RELAY_RESOLVER_MODEL_INSTANCE_FIELD: StringKey = "__relay_model_instance".intern();
    /// Name of docblock tag used to indicate that a resolver reads data from a
    /// fragment, and what the name of that fragment is.
    pub static ref ROOT_FRAGMENT_FIELD: StringKey = "rootFragment".intern();
    /// Name of docblock tag used to indicate that a shadow resolver returns
    /// data conforming to a specific fragment's shape.
    pub static ref RETURN_FRAGMENT_FIELD: StringKey = "returnFragment".intern();
    /// _Legacy resolver syntax_: The name of the docblock tag used to indicate that the resolver returns
    /// a fully/deeply populated weak type. This feature is deprecated.
    pub static ref OUTPUT_TYPE_FIELD: StringKey = "outputType".intern();
    /// Docblock tag used to indicate that a docblock is defining a "weak" type.
    /// Such docblocks should be followed by a type export which will act as the
    /// Flow/TypeScript type of the backing model for this type.
    pub static ref WEAK_FIELD: StringKey = "weak".intern();
    pub static ref EMPTY_STRING: StringKey = "".intern();
    /// Name of the directive that Relay uses to implement fragment arguments.
    /// Replicated here since @rootFragments may need to be checked for
    /// arguments.
    ///
    /// See https://relay.dev/docs/next/api-reference/graphql-and-directives/#argumentdefinitions
    pub static ref ARGUMENT_DEFINITIONS: DirectiveName =
        DirectiveName("argumentDefinitions".intern());
    /// The following are arguments used by the above `@argumentDefinitions`.
    pub static ref ARGUMENT_TYPE: StringKey = "type".intern();
    pub static ref DEFAULT_VALUE: StringKey = "defaultValue".intern();
    pub static ref PROVIDER_ARG_NAME: StringKey = "provider".intern();

    /// Field name used for the ID of strong model types.
    /// Note: this should **only** be used for resolvers! The id field for server
    /// types is configurable in the config, and thus cannot be hard-coded.
    pub static ref KEY_RESOLVER_ID_FIELD: StringKey = "id".intern();

    /// Directive name used in parallel with @relay_resolver which includes a
    /// hash of the docblock from which a resolver was generated. Used to ensure that changes to the docblock
    /// invalidate compiler state.
    ///
    /// See D48588439
    pub static ref RELAY_RESOLVER_SOURCE_HASH: DirectiveName = DirectiveName("resolver_source_hash".intern());
    /// Argument name used with @resolver_source_hash to specify the hash value.
    pub static ref RELAY_RESOLVER_SOURCE_HASH_VALUE: ArgumentName = ArgumentName("value".intern());
}
