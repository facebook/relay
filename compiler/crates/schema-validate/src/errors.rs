/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::ArgumentName;
use common::InterfaceName;
use common::ObjectName;
use common::UnionName;
use intern::string_key::StringKey;
use thiserror::Error;

#[derive(Clone, Debug, Error, serde::Serialize)]
pub enum SchemaValidationError {
    #[error("'{0}' root type must be provided.")]
    MissingRootType(StringKey),

    #[error("'{0}' root type must be Object type. Found {1}")]
    InvalidRootType(StringKey, String),

    #[error("Name '{0}' must not begin with '__', which is reserved by GraphQL introspection.")]
    InvalidNamePrefix(String),

    #[error("Names must match /^[_a-zA-Z][_a-zA-Z0-9]*$/ but '{0}' does not.")]
    InvalidName(String),

    #[error("Duplicate field '{0}' found.")]
    DuplicateField(StringKey),

    #[error("Duplicate argument '{0}' found on field/directive '{1}'.")]
    DuplicateArgument(ArgumentName, StringKey),

    #[error("Type must define one or more fields.")]
    TypeWithNoFields,

    #[error("The type of '{0}.{1}' must be Output Type but got {2}.")]
    InvalidFieldType(StringKey, StringKey, String),

    #[error("The type of '{0}.{1}({2}:)' must be InputType but got: {3}.")]
    InvalidArgumentType(StringKey, StringKey, ArgumentName, String),

    #[error("Type '{0}' can only implement '{1}' once.")]
    DuplicateInterfaceImplementation(StringKey, InterfaceName),

    #[error("Interface field '{0}.{1}' expected but {2} '{3}' does not provide it.")]
    InterfaceFieldNotProvided(InterfaceName, StringKey, StringKey, StringKey),

    #[error("Interface field '{0}.{1}' expects type '{2}' but '{3}.{1}' is of type '{4}'.")]
    NotASubType(InterfaceName, StringKey, String, StringKey, String),

    #[error("Interface field argument '{0}.{1}({2}:)' expected but '{3}.{1}' does not provide it.")]
    InterfaceFieldArgumentNotProvided(InterfaceName, StringKey, ArgumentName, StringKey),

    #[error(
        "Interface field argument '{0}.{1}({2}:)' expects type '{3}' but '{4}.{1}({2}:)' is type '{5}'."
    )]
    NotEqualType(
        InterfaceName,
        StringKey,
        ArgumentName,
        String,
        StringKey,
        String,
    ),

    #[error(
        "Object field '{0}.{1}' includes required argument '{2}' that is missing from the Interface field '{3}.{1}'."
    )]
    MissingRequiredArgument(StringKey, StringKey, ArgumentName, InterfaceName),

    #[error("Union type {0} must define one or more member types.")]
    UnionWithNoMembers(UnionName),

    #[error("Union can only include member {0} once.")]
    DuplicateMember(ObjectName),

    #[error("Enum must define one or more values.")]
    EnumWithNoValues,

    #[error("Enum cannot include value: {0}.")]
    InvalidEnumValue(StringKey),

    #[error("Cyclic reference found for interface inheritance: {0}.")]
    CyclicInterfaceInheritance(String),
}
