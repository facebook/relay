/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::StringKey;
use thiserror::Error;

#[derive(
    Clone,
    Copy,
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
    #[error("Plural types not supported")]
    PluralNotSupported,
    #[error(
        "Failed to find type definition for type `{export_name}` from module `{module_name}`, please make sure `{export_name}` is imported and it is a resolver type"
    )]
    ModuleNotFound {
        export_name: StringKey,
        module_name: StringKey,
    },
}
