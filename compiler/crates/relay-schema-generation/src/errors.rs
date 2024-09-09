/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::StringKey;
use thiserror::Error;

use crate::find_resolver_imports::JSImportType;

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
        "Can't find Flow type definition for `{name}`. Expected the type to be imported from another module, or exported from the current module"
    )]
    ExpectedFlowDefinitionForType { name: StringKey },
    #[error("Expected import source to be a string literal")]
    ExpectedStringLiteralSource,
    #[error("Generic types not supported")]
    GenericNotSupported,
    #[error("Object types not supported")]
    ObjectNotSupported,
    #[error("{name} is not supported")]
    UnsupportedType { name: &'static str },
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
    Todo,

    #[error("Expected the function name to exist")]
    MissingFunctionName,
    #[error("Expected the function return type to exist")]
    MissingReturnType,
    #[error("Expected Relay Resolver function param to include type annotation")]
    MissingParamType,
    #[error("Cannot use a LiveState that is also optional")]
    NoOptionalLiveType,
    #[error("Unsupported generic: `{name}`")]
    UnSupportedGeneric { name: StringKey },
    #[error(
        "Expected resolver arguments to be in the second function argument and in format of `args: {{field1: value1, field2: value2}}`"
    )]
    IncorrectArgumentsDefinition,
    #[error(
        "Multiple docblock descriptions found for this @RelayResolver. Please only include one description (a comment in the docblock uninterrupted by a resolver \"@<field>\")"
    )]
    MultipleDocblockDescriptions,
    #[error(
        "A nullable strong type is provided, please make the type non-nullable. The type can't be nullable in the runtime."
    )]
    UnexpectedNullableStrongType,
    #[error("Unable to find module resolution due to previous errors for source file: {path}.")]
    UnexpectedFailedToFindModuleResolution { path: &'static str },

    #[error(
        "Returning a strong object directly in a resolver is not allowed. Please return the `id` of the strong object, and use `IdOf<'{typename}'>` as the Flow return type."
    )]
    StrongReturnTypeNotAllowed { typename: StringKey },
    #[error(
        "Multiple custom scalar types found to map to `{flow_type}`. This is an error when using client side resolvers as the Flow type must map to a single GraphQL custom scalar."
    )]
    DuplicateCustomScalars { flow_type: StringKey },

    #[error(
        "Duplicate GraphQL type definitions found for flow type `{import_type}` from `{module_name}`, please make sure each GraphQL type maps to a unique flow type."
    )]
    DuplicateTypeDefinitions {
        module_name: StringKey,
        import_type: JSImportType,
    },
}
