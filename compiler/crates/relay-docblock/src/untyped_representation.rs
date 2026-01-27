/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;
use std::collections::hash_map::Entry;
use std::fmt::Display;
use std::hash::Hash;

use common::Diagnostic;
use common::WithLocation;
use docblock_shared::ResolverSourceHash;
use docblock_syntax::DocblockAST;
use docblock_syntax::DocblockSection;
use graphql_ir::reexport::StringKey;

use crate::DEPRECATED_FIELD;
use crate::EDGE_TO_FIELD;
use crate::EMPTY_STRING;
use crate::FIELD_NAME_FIELD;
use crate::LIVE_FIELD;
use crate::ON_INTERFACE_FIELD;
use crate::ON_TYPE_FIELD;
use crate::OUTPUT_TYPE_FIELD;
use crate::RELAY_RESOLVER_FIELD;
use crate::RETURN_FRAGMENT_FIELD;
use crate::ROOT_FRAGMENT_FIELD;
use crate::SEMANTIC_NON_NULL_FIELD;
use crate::WEAK_FIELD;
use crate::errors::UntypedRepresentationErrorMessages;
use crate::ir::IrField;

/// All fields which are allowed in RelayResolver docblocks.
#[derive(
    Clone,
    Copy,
    Eq,
    Debug,
    PartialEq,
    Hash,
    Ord,
    PartialOrd,
    serde::Serialize
)]
pub enum AllowedFieldName {
    RelayResolverField,
    FieldNameField,
    OnTypeField,
    OnInterfaceField,
    RootFragmentField,
    ReturnFragmentField,
    EdgeToField,
    DeprecatedField,
    LiveField,
    OutputTypeField,
    WeakField,
    SemanticNonNullField,
}

impl Display for AllowedFieldName {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AllowedFieldName::RelayResolverField => write!(f, "{}", *RELAY_RESOLVER_FIELD),
            AllowedFieldName::FieldNameField => write!(f, "{}", *FIELD_NAME_FIELD),
            AllowedFieldName::OnTypeField => write!(f, "{}", *ON_TYPE_FIELD),
            AllowedFieldName::OnInterfaceField => write!(f, "{}", *ON_INTERFACE_FIELD),
            AllowedFieldName::RootFragmentField => write!(f, "{}", *ROOT_FRAGMENT_FIELD),
            AllowedFieldName::ReturnFragmentField => write!(f, "{}", *RETURN_FRAGMENT_FIELD),
            AllowedFieldName::EdgeToField => write!(f, "{}", *EDGE_TO_FIELD),
            AllowedFieldName::DeprecatedField => write!(f, "{}", *DEPRECATED_FIELD),
            AllowedFieldName::LiveField => write!(f, "{}", *LIVE_FIELD),
            AllowedFieldName::OutputTypeField => write!(f, "{}", *OUTPUT_TYPE_FIELD),
            AllowedFieldName::WeakField => write!(f, "{}", *WEAK_FIELD),
            AllowedFieldName::SemanticNonNullField => write!(f, "{}", *SEMANTIC_NON_NULL_FIELD),
        }
    }
}

impl TryFrom<WithLocation<StringKey>> for AllowedFieldName {
    type Error = Diagnostic;

    fn try_from(value: WithLocation<StringKey>) -> Result<Self, Self::Error> {
        match value.item {
            value if value == *RELAY_RESOLVER_FIELD => Ok(AllowedFieldName::RelayResolverField),
            value if value == *FIELD_NAME_FIELD => Ok(AllowedFieldName::FieldNameField),
            value if value == *ON_TYPE_FIELD => Ok(AllowedFieldName::OnTypeField),
            value if value == *ON_INTERFACE_FIELD => Ok(AllowedFieldName::OnInterfaceField),
            value if value == *ROOT_FRAGMENT_FIELD => Ok(AllowedFieldName::RootFragmentField),
            value if value == *RETURN_FRAGMENT_FIELD => Ok(AllowedFieldName::ReturnFragmentField),
            value if value == *EDGE_TO_FIELD => Ok(AllowedFieldName::EdgeToField),
            value if value == *DEPRECATED_FIELD => Ok(AllowedFieldName::DeprecatedField),
            value if value == *LIVE_FIELD => Ok(AllowedFieldName::LiveField),
            value if value == *SEMANTIC_NON_NULL_FIELD => {
                Ok(AllowedFieldName::SemanticNonNullField)
            }
            value if value == *OUTPUT_TYPE_FIELD => Ok(AllowedFieldName::OutputTypeField),
            value if value == *WEAK_FIELD => Ok(AllowedFieldName::WeakField),
            invalid_value => Err(Diagnostic::error(
                UntypedRepresentationErrorMessages::UnknownField {
                    field_name: invalid_value,
                },
                value.location,
            )),
        }
    }
}

/// When generating this struct from a docblock, we only perform very basic
/// validation, namely that no field is defined twice and no unknown fields
/// are defined by the user.
#[derive(Debug)]
pub(crate) struct UntypedDocblockRepresentation {
    pub(crate) description: Option<WithLocation<StringKey>>,
    pub(crate) fields: HashMap<AllowedFieldName, IrField>,
    pub(crate) source_hash: ResolverSourceHash,
}

impl UntypedDocblockRepresentation {
    fn new(source_hash: ResolverSourceHash) -> Self {
        Self {
            description: None,
            fields: HashMap::new(),
            source_hash,
        }
    }
}

pub(crate) fn parse_untyped_docblock_representation(
    ast: &DocblockAST,
) -> Result<UntypedDocblockRepresentation, Vec<Diagnostic>> {
    let mut untyped_repr: UntypedDocblockRepresentation =
        UntypedDocblockRepresentation::new(ast.source_hash);
    let mut errors = vec![];
    for section in &ast.sections {
        match section {
            DocblockSection::Field(docblock_field) => {
                match docblock_field.field_name.try_into() {
                    Ok(allowed_field_name) => match untyped_repr.fields.entry(allowed_field_name) {
                        Entry::Occupied(_) => {
                            errors.push(Diagnostic::error(
                                UntypedRepresentationErrorMessages::DuplicateField {
                                    field_name: allowed_field_name,
                                },
                                docblock_field.field_name.location,
                            ));
                        }
                        Entry::Vacant(entry) => {
                            entry.insert(IrField::new(
                                docblock_field.field_name.location,
                                docblock_field.field_value,
                            ));
                        }
                    },
                    Err(diagnostic) => errors.push(diagnostic),
                };
            }
            DocblockSection::FreeText(free_text) => {
                if free_text.item == *EMPTY_STRING {
                    continue;
                }
                if untyped_repr.description.is_some() {
                    errors.push(Diagnostic::error(
                        UntypedRepresentationErrorMessages::MultipleDescriptions,
                        free_text.location,
                    ));
                } else {
                    untyped_repr.description = Some(*free_text)
                }
            }
        }
    }
    if errors.is_empty() {
        Ok(untyped_repr)
    } else {
        Err(errors)
    }
}
