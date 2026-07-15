/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod field_transform;
mod fragment_dependencies;
mod resolver_utils;
mod shadow_transform;
mod spread_transform;

use common::DiagnosticsResult;
use common::FeatureFlags;
use common::Location;
use common::WithLocation;
use graphql_ir::Argument;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::Program;
use graphql_ir::associated_data_impl;
use intern::string_key::StringKey;
use relay_config::ProjectName;
use schema::Field;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

pub use self::field_transform::ResolverInfo;
pub use self::field_transform::ResolverNormalizationInfo;
pub use self::field_transform::get_resolver_info;
use self::field_transform::relay_resolvers_fields_transform;
pub use self::fragment_dependencies::get_all_resolver_fragment_dependency_names;
pub use self::fragment_dependencies::get_resolver_fragment_dependency_name;
pub use self::fragment_dependencies::get_resolver_return_fragment_name;
pub(crate) use self::resolver_utils::get_argument_value;
pub(crate) use self::resolver_utils::get_bool_argument_is_true;
pub use self::resolver_utils::resolver_import_alias;
pub use self::resolver_utils::resolver_type_import_alias;
use self::shadow_transform::shadow_resolvers_transform;
use self::spread_transform::relay_resolvers_spread_transform;
use super::ValidationMessage;

/// Which artifact pipeline a `relay_resolvers` run is feeding.
///
/// This only affects the shadow-resolver transplant: the consumer's selections
/// are transplanted onto the shadowed server field so they are fetched by the
/// *main operation* (`ForOperation`). The transplant must NOT reach the reader
/// fragment or the consumer's public `$data` (`ForReader`), where it would defeat
/// masking -- the consumer reads those selections off the resolver-returned
/// pointer via the client-edge reader selections, not off a sibling field.
/// Non-shadow resolvers are unaffected by this distinction.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ResolversPipeline {
    /// Operation/operation-text pipeline: emit the shadow transplant so the main
    /// query normalizes/fetches `page { id __typename <consumer selections> }`.
    ForOperation,
    /// Reader/typegen pipeline: suppress the shadow transplant so it stays out of
    /// the reader fragment and the consumer's `$data`.
    ForReader,
}

/// Transform Relay Resolver fields. This is done in three passes.
///
/// First we locate fields which are backed Relay Resolvers and attach a
/// metadata directive to them. Then we validate shadow resolver features
/// (like @returnFragment). Finally we convert those fields into either an
/// annotated stub `__id` field, or an annotated fragment spread referencing the
/// resolver's root fragment.
///
/// See the docblock for `relay_resolvers_spread_transform` for more details
/// about the resulting format.
pub fn relay_resolvers(
    project_name: ProjectName,
    program: &Program,
    feature_flags: &FeatureFlags,
    pipeline: ResolversPipeline,
    id_field_name: StringKey,
) -> DiagnosticsResult<Program> {
    let transformed_fields_program =
        relay_resolvers_fields_transform(project_name, program, id_field_name)?;
    let validated_program =
        shadow_resolvers_transform(&transformed_fields_program, feature_flags, id_field_name)?;
    relay_resolvers_spread_transform(
        &validated_program,
        pipeline,
        feature_flags.enable_shadow_resolvers.is_fully_enabled(),
    )
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum ResolverOutputTypeInfo {
    /// Resolver returns an opaque scalar field
    ScalarField,
    Composite(ResolverNormalizationInfo),
    /// Resolver returns one or more edges to items in the store.
    EdgeTo,
    Legacy,
}

impl ResolverOutputTypeInfo {
    pub fn normalization_ast_should_have_is_output_type_true(&self) -> bool {
        match self {
            ResolverOutputTypeInfo::ScalarField => true,
            ResolverOutputTypeInfo::Composite(_) => true,
            ResolverOutputTypeInfo::EdgeTo => false,
            ResolverOutputTypeInfo::Legacy => false,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub enum FragmentDataInjectionMode {
    Field { name: StringKey, is_required: bool }, // TODO: Add Support for FullData
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub enum ResolverSchemaGenType {
    ResolverModule,
    PropertyLookup { property_name: StringKey },
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct RelayResolverFieldMetadata {
    pub(crate) field_parent_type: StringKey,
    pub(crate) import_path: StringKey,
    pub(crate) import_name: Option<StringKey>,
    pub(crate) fragment_name: Option<FragmentDefinitionName>,
    pub(crate) fragment_data_injection_mode: Option<FragmentDataInjectionMode>,
    pub(crate) field_path: StringKey,
    pub(crate) live: bool,
    pub(crate) output_type_info: ResolverOutputTypeInfo,
    pub(crate) type_confirmed: bool,
    pub(crate) resolver_type: ResolverSchemaGenType,
    pub return_fragment: Option<WithLocation<FragmentDefinitionName>>,
}

impl RelayResolverFieldMetadata {
    /// Returns true if the resolver defines a root fragment.
    pub fn has_root_fragment(&self) -> bool {
        self.fragment_name.is_some()
    }
}

associated_data_impl!(RelayResolverFieldMetadata);

/// Typed IR associated-data marker for shadow resolvers.
///
/// The `@returnFragment` placeholder spread authored
/// inside a shadow resolver's `@rootFragment` is converted, before `build_ir`
/// runs, into the schema-known `@__relay_shadow_return` directive on the enclosing
/// shadowed field, so that `build_ir` never sees an undefined fragment spread. The
/// shadow resolver transform then converts that syntax directive into this typed
/// associated-data marker and strips the syntax directive, so the marker (rather
/// than a lasting plain directive) is the long-lived IR representation that later
/// transforms consume to transplant consumer selections and build the pointer
/// edge.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct ShadowReturnMarker {
    /// Name of the original `@returnFragment` placeholder this marker replaced.
    pub return_fragment_name: FragmentDefinitionName,
    /// Location of the original placeholder spread, for error reporting.
    pub spread_location: Location,
}
associated_data_impl!(ShadowReturnMarker);

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct RelayResolverMetadata {
    pub field_id: FieldID,
    pub import_path: StringKey,
    pub import_name: Option<StringKey>,
    pub field_alias: Option<StringKey>,
    pub field_path: StringKey,
    pub field_arguments: Vec<Argument>,
    /// Arguments that map to the root fragment's @argumentDefinitions.
    /// Partitioned from field.arguments during the spread transform.
    /// Needed by exec-time normalization codegen to include the variable
    /// mapping (e.g., include_friend → $my_flag) that would otherwise be
    /// lost since the normalization AST has no FragmentSpread to carry them.
    pub fragment_arguments: Vec<Argument>,
    pub live: bool,
    pub output_type_info: ResolverOutputTypeInfo,
    /// A tuple with fragment name and field name we need read
    /// of that fragment to pass it to the resolver function.
    pub fragment_data_injection_mode: Option<(
        WithLocation<FragmentDefinitionName>,
        FragmentDataInjectionMode,
    )>,
    pub type_confirmed: bool,
    pub resolver_type: ResolverSchemaGenType,
    pub return_fragment: Option<WithLocation<FragmentDefinitionName>>,
}
associated_data_impl!(RelayResolverMetadata);

impl RelayResolverMetadata {
    pub fn field<'schema>(&self, schema: &'schema SDLSchema) -> &'schema Field {
        schema.field(self.field_id)
    }

    pub fn field_name(&self, schema: &SDLSchema) -> StringKey {
        self.field(schema).name.item
    }

    pub fn field_parent_type_name(&self, schema: &SDLSchema) -> StringKey {
        let parent_type = self
            .field(schema)
            .parent_type
            .expect("Expected parent type");
        match parent_type {
            Type::Interface(interface_id) => schema.interface(interface_id).name.item.0,
            Type::Object(object_id) => schema.object(object_id).name.item.0,
            _ => panic!("Unexpected parent type for resolver."),
        }
    }

    pub fn generate_local_resolver_name(&self, schema: &SDLSchema) -> StringKey {
        resolver_import_alias(self.field_parent_type_name(schema), self.field_name(schema))
    }
    pub fn generate_local_resolver_type_name(&self, schema: &SDLSchema) -> StringKey {
        resolver_type_import_alias(self.field_parent_type_name(schema), self.field_name(schema))
    }
}
