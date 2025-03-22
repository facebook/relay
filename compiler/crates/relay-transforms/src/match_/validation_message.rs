/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::ArgumentName;
use common::InterfaceName;
use common::ObjectName;
use common::ScalarName;
use common::UnionName;
use graphql_ir::ExecutableDefinitionName;
use graphql_ir::FragmentDefinitionName;
use intern::string_key::StringKey;
use thiserror::Error;

#[derive(Error, Debug, serde::Serialize)]
#[serde(tag = "type")]
pub enum ValidationMessage {
    #[error("Invalid @match selection: all selections should be fragment spreads with @module.")]
    InvalidMatchNotAllSelectionsFragmentSpreadWithModule,

    #[error(
        "Invalid @match selection: @alias may not be applied to fragment spreads within @match."
    )]
    InvalidAliasWithinMatch,

    #[error("'{name}' should be defined on the server schema.")]
    MissingServerSchemaDefinition { name: StringKey },

    #[error("Using @module requires the schema to define a scalar '{js_field_type}' type.")]
    InvalidModuleNonScalarJSField { js_field_type: ScalarName },

    #[error(
        "@module used on invalid fragment spread '...{spread_name}'. @module requires the fragment type '{type_string}' to have a '{js_field_name}({js_field_module_arg}: String!, {js_field_id_arg}: String): {js_field_type}' field (your schema may choose to omit the 'id'  argument but if present it must accept a 'String')."
    )]
    InvalidModuleInvalidSchemaArguments {
        spread_name: FragmentDefinitionName,
        type_string: StringKey,
        js_field_name: StringKey,
        js_field_module_arg: ArgumentName,
        js_field_id_arg: ArgumentName,
        js_field_type: ScalarName,
    },

    #[error(
        "@module used on invalid fragment spread '...{spread_name}'. @module may only be used with fragments on a concrete (object) type, but the fragment has abstract type '{type_string}'."
    )]
    InvalidModuleNotOnObject {
        spread_name: FragmentDefinitionName,
        type_string: StringKey,
    },

    #[error("@module does not support @arguments.")]
    InvalidModuleWithArguments,

    #[error(
        "@module used on invalid fragment spread '...{spread_name}'. @module may not have additional directives."
    )]
    InvalidModuleWithAdditionalDirectives { spread_name: FragmentDefinitionName },

    #[error("@module does not support @inline fragments.")]
    InvalidModuleWithInline,

    #[error("Expected the 'name' argument of @module to be a literal string.")]
    InvalidModuleNonLiteralName,

    #[error("Expected the 'name' argument to be defined.")]
    InvalidModuleNoName,

    #[error(
        "Invalid @module selection: documents with multiple fields containing 3D selections must specify a unique 'key' value for each field: use '{parent_name} @match(key: \"{document_name}_<localName>\")'."
    )]
    InvalidModuleSelectionWithoutKey {
        document_name: ExecutableDefinitionName,
        parent_name: StringKey,
    },

    #[error(
        "Invalid @module selection: concrete type '{type_name}' was matched multiple times at path '{alias_path}' but with a different fragment or module name."
    )]
    InvalidModuleSelectionMultipleMatches {
        type_name: StringKey,
        alias_path: String,
    },

    #[error("Direct use of the '{field_name}' field is not allowed, use '@match/@module instead.")]
    InvalidDirectUseOfJSField { field_name: StringKey },

    #[error(
        "Expected the 'key' argument of @match to be a literal string starting with the document name, e.g. '{document_name}_<localName>'."
    )]
    InvalidMatchKeyArgument {
        document_name: ExecutableDefinitionName,
    },

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
    InvalidMatchNoUserSuppliedSupportedArg { supported_arg: ArgumentName },

    #[error(
        "Invalid @match selection: expected at least one @module selection. Remove @match or add a '...Fragment @module()' selection."
    )]
    InvalidMatchNoModuleSelection,

    #[error(
        "@match without a `key` argument and on a field without the `supported` argument is a no-op, please remove the `@match`."
    )]
    InvalidMatchWithNoSupportedArgument,

    #[error(
        "Invalid fragment spread '...{spread_name}'. Fragments for interface '{parent_interface}' should be backed by relay resolver models."
    )]
    MissingRelayResolverModelForInterface {
        spread_name: FragmentDefinitionName,
        parent_interface: InterfaceName,
    },

    #[error(
        "Invalid fragment spread '...{spread_name}'. Fragments for union '{parent_union}' should be backed by relay resolver models."
    )]
    MissingRelayResolverModelForUnion {
        spread_name: FragmentDefinitionName,
        parent_union: UnionName,
    },

    #[error(
        "Invalid fragment spread '...{spread_name}'. Object '{object}' should be backed by a relay resolver model."
    )]
    MissingRelayResolverModelForObject {
        spread_name: FragmentDefinitionName,
        object: ObjectName,
    },
}
