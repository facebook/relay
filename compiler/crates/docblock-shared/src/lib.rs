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
    pub static ref RELAY_RESOLVER_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("relay_resolver".intern());
    pub static ref RESOLVER_VALUE_SCALAR_NAME: ScalarName =
        ScalarName("RelayResolverValue".intern());
    pub static ref RELAY_RESOLVER_FIELD: StringKey = "RelayResolver".intern();
    pub static ref RELAY_RESOLVER_MODEL_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("__RelayResolverModel".intern());
    pub static ref FRAGMENT_KEY_ARGUMENT_NAME: ArgumentName =
        ArgumentName("fragment_name".intern());
    pub static ref RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE: DirectiveName =
        DirectiveName("__RelayWeakObject".intern());
    pub static ref LIVE_ARGUMENT_NAME: ArgumentName = ArgumentName("live".intern());
    pub static ref IMPORT_NAME_ARGUMENT_NAME: ArgumentName = ArgumentName("import_name".intern());
    pub static ref HAS_OUTPUT_TYPE_ARGUMENT_NAME: ArgumentName =
        ArgumentName("has_output_type".intern());
    pub static ref IMPORT_PATH_ARGUMENT_NAME: ArgumentName = ArgumentName("import_path".intern());
    pub static ref INJECT_FRAGMENT_DATA_ARGUMENT_NAME: ArgumentName =
        ArgumentName("inject_fragment_data".intern());
    pub static ref GENERATED_FRAGMENT_ARGUMENT_NAME: ArgumentName =
        ArgumentName("generated_fragment".intern());
    pub static ref FIELD_NAME_FIELD: StringKey = "fieldName".intern();
    pub static ref ON_TYPE_FIELD: StringKey = "onType".intern();
    pub static ref ON_INTERFACE_FIELD: StringKey = "onInterface".intern();
    pub static ref EDGE_TO_FIELD: StringKey = "edgeTo".intern();
    pub static ref DEPRECATED_FIELD: StringKey = "deprecated".intern();
    pub static ref LIVE_FIELD: StringKey = "live".intern();
    pub static ref SEMANTIC_NON_NULL_FIELD: StringKey = "semanticNonNull".intern();
    // Using a longer name version for this "special" field
    // help us avoid potential collision with product code (__self, __instance can be used for something else)
    pub static ref RELAY_RESOLVER_MODEL_INSTANCE_FIELD: StringKey = "__relay_model_instance".intern();
    pub static ref ROOT_FRAGMENT_FIELD: StringKey = "rootFragment".intern();
    pub static ref OUTPUT_TYPE_FIELD: StringKey = "outputType".intern();
    pub static ref WEAK_FIELD: StringKey = "weak".intern();
    pub static ref EMPTY_STRING: StringKey = "".intern();
    pub static ref ARGUMENT_DEFINITIONS: DirectiveName =
        DirectiveName("argumentDefinitions".intern());
    pub static ref ARGUMENT_TYPE: StringKey = "type".intern();
    pub static ref DEFAULT_VALUE: StringKey = "defaultValue".intern();
    pub static ref PROVIDER_ARG_NAME: StringKey = "provider".intern();
    // Note: this should **only** be used for resolvers! The id field for server
    // types is configurable in the config, and thus cannot be hard-coded.
    pub static ref KEY_RESOLVER_ID_FIELD: StringKey = "id".intern();

    pub static ref RELAY_RESOLVER_SOURCE_HASH: DirectiveName = DirectiveName("resolver_source_hash".intern());
    pub static ref RELAY_RESOLVER_SOURCE_HASH_VALUE: ArgumentName = ArgumentName("value".intern());

}
