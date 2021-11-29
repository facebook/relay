/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::definitions::Type;
use graphql_syntax::OperationType;
use intern::string_key::StringKey;
use thiserror::Error;

pub type Result<T> = std::result::Result<T, SchemaError>;

#[derive(Debug, Error)]
pub enum SchemaError {
    #[error("Duplicate {0:?} type definition, got '{1}' and '{2}'.")]
    DuplicateOperationDefinition(OperationType, StringKey, StringKey),

    #[error("Duplicate directive definition '{0}'.")]
    DuplicateDirectiveDefinition(StringKey),

    #[error("Cannot extend type '{0}', the type is not defined on the server schema.")]
    ExtendUndefinedType(StringKey),

    #[error("Expected an object type for name '{0}', got '{1:?}'.")]
    ExpectedObjectReference(StringKey, Type),

    #[error("Expected an interface type for name '{0}', got '{1:?}'.")]
    ExpectedInterfaceReference(StringKey, Type),

    #[error("Reference to undefined type '{0}'.")]
    UndefinedType(StringKey),

    #[error("Duplicate field definition '{0}' found.")]
    DuplicateField(StringKey),

    #[error("Duplicate definition for type '{0}'.")]
    DuplicateType(StringKey),

    #[error("Invalid ID '{0}' provided for type '{1}'")]
    UnknownTypeID(usize, String),

    // TODO: These should be replaced with error codes or by unifying the parsers.
    #[error("Parse Error '{0}' at {1}.\nError line:'{2}'")]
    Syntax(String, String, String),

    #[error(
        "Expected a field of the input object to be a valid input object, scalar, or enum. Got '{0}'."
    )]
    ExpectedInputType(StringKey),
}
