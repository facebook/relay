/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::StringKey;
use thiserror::Error;

use crate::JSImportType;

#[derive(
    Clone,
    Debug,
    Error,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    serde::Serialize
)]
pub enum SchemaGenerationError {
    #[error(
        "Can't find type import for `{name}`, expected the type to be imported from another module"
    )]
    ExpectedFlowImportForType { name: StringKey },
    #[error("Expected import source to be a string literal")]
    ExpectedStringLiteralSource,
    #[error("Generic types not supported")]
    GenericNotSupported,
    #[error("Object types not supported")]
    ObjectNotSupported,
    #[error("This type is not supported")]
    UnsupportedType,
    #[error("Type aliases in Relay resolvers are expected to be object types")]
    ExpectedTypeAliasToBeObject,
    #[error("Expected object definition to include fields")]
    ExpectedWeakObjectToHaveFields,
    #[error("@RelayResolver annotation is expected to be on a named export")]
    ExpectedNamedExport,
    #[error("@RelayResolver annotation is expected to be on a named function or type alias")]
    ExpectedFunctionOrTypeAlias,
    #[error(
        "Types used in @RelayResolver definitions should be imported using named or default imports (without using a `*`)"
    )]
    UseNamedOrDefaultImport,
    #[error(
        "Failed to find type definition for `{entity_name}` using a {export_type} import from module `{module_name}`. Please make sure `{entity_name}` is imported using a named or default import and that it is a resolver type"
    )]
    ModuleNotFound {
        entity_name: StringKey,
        export_type: JSImportType,
        module_name: StringKey,
    },
    #[error("Not yet implemented")]
    TODO,

    #[error("Expected the function name to exist")]
    MissingFunctionName,
    #[error("Expected the function return type to exist")]
    MissingReturnType,
    #[error("Expected to have at least one function parameter")]
    MissingFunctionParam,
    #[error("Expected Relay Resolver function param to include type annotation")]
    MissingParamType,
    #[error("Cannot use a LiveState that is also optional")]
    NoOptionalLiveType,
}
