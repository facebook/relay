/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::StringKey;
use schema::{Type, TypeReference};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum SchemaValidationError {
    #[error("'{0}' root type must be provided.")]
    MissingRootType(StringKey),

    #[error("'{0}' root type must be Object type. Found '{1:?}'")]
    InvalidRootType(StringKey, Type),

    #[error("Name '{0}' must not begin with '__', which is reserved by GraphQL introspection.")]
    InvalidNamePrefix(String),

    #[error("Names must match /^[_a-zA-Z][_a-zA-Z0-9]*$/ but '{0}' does not.")]
    InvalidName(String),

    #[error("Duplicate field '{0}' found.")]
    DuplicateField(StringKey),

    #[error("Duplicate argument '{0}' found on field/directive '{1}'.")]
    DuplicateArgument(StringKey, StringKey),

    #[error("Type must define one or more fields.")]
    TypeWithNoFields,

    #[error("The type of '{0}.{1}' must be Output Type but got: '{2:?}'.")]
    InvalidFieldType(StringKey, StringKey, TypeReference),

    #[error("The type of '{0}.{1}({2}:)' must be InputType but got: '{3:?}'.")]
    InvalidArgumentType(StringKey, StringKey, StringKey, TypeReference),

    #[error("Type '{0}' can only implement '{1}' once.")]
    DuplicateInterfaceImplementation(StringKey, StringKey),

    #[error("Interface field '{0}.{1}' expected but '{2}' does not provide it.")]
    InterfaceFieldNotProvided(StringKey, StringKey, StringKey),

    #[error("Interface field '{0}.{1}' expects type '{2}' but '{3}.{1}' is of type '{4}'.")]
    NotASubType(StringKey, StringKey, StringKey, StringKey, StringKey),

    #[error(
        "Interface field argument '{0}.{1}({2}:)' expected but '{3}.{1}' does not provide it."
    )]
    InterfaceFieldArgumentNotProvided(StringKey, StringKey, StringKey, StringKey),

    #[error(
        "Interface field argument '{0}.{1}({2}:)' expects type '{3}' but '{4}.{1}({2}:)' is type '{5}'."
    )]
    NotEqualType(
        StringKey,
        StringKey,
        StringKey,
        StringKey,
        StringKey,
        StringKey,
    ),

    #[error(
        "Object field '{0}.{1}' includes required argument '{2}' that is missing from the Interface field '{3}.{1}'."
    )]
    MissingRequiredArgument(StringKey, StringKey, StringKey, StringKey),

    #[error("Union type must define one or more member types.")]
    UnionWithNoMembers(StringKey),

    #[error("Union can only include member {0} once.")]
    DuplicateMember(StringKey),

    #[error("Enum must define one or more values.")]
    EnumWithNoValues,

    #[error("Enum cannot include value: {0}.")]
    InvalidEnumValue(StringKey),

    #[error("Cyclic reference found for interface inheritance: {0}.")]
    CyclicInterfaceInheritance(String),
}
