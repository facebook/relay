/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::ArgumentName;
use common::DirectiveName;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Argument;
use graphql_ir::ConstantValue;
use graphql_ir::Directive;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::Value;
use intern::string_key::Intern;
use intern::string_key::StringKeySet;
use lazy_static::lazy_static;

lazy_static! {
    pub static ref DIRECTIVE_SPLIT_OPERATION: DirectiveName =
        DirectiveName("__splitOperation".intern());
    static ref ARG_DERIVED_FROM: ArgumentName = ArgumentName("derivedFrom".intern());
    static ref ARG_PARENT_DOCUMENTS: ArgumentName = ArgumentName("parentDocuments".intern());
    static ref ARG_RAW_RESPONSE_TYPE: ArgumentName = ArgumentName("rawResponseType".intern());
}

/// The split operation metadata directive indicates that an operation was split
/// out by the compiler from a parent normalization file.
///
/// In the following GraphQL code, we would generate a `F$normalization.graphql.js`
/// file. For that `SplitOperation`:
/// - `derived_from` is `F`.
/// - `parent_documents` are `Q1` and `F2`.
///
/// ```graphql
/// fragment F on Query {
///   # ...
/// }
/// query Q1 {
///   ...F @module
/// }
/// query Q2 {
///   ...F
/// }
/// fragment F2 on Query {
///   ...F @module
/// }
/// ```
pub struct SplitOperationMetadata {
    /// Name of the fragment that this split operation represents. This is used
    /// to determine the name of the generated artifact.
    pub derived_from: Option<FragmentDefinitionName>,

    /// Location of the source file for this split operation
    pub location: Location,

    /// The names of the fragments and operations that included this fragment.
    /// They are the reason this split operation exist. If they are all removed,
    /// this file also needs to be removed.
    pub parent_documents: StringKeySet,

    /// Should a @raw_response_type style type be generated.
    pub raw_response_type: bool,
}

impl SplitOperationMetadata {
    pub fn to_directive(&self) -> Directive {
        let mut arguments = vec![];
        if let Some(derived_from) = self.derived_from {
            arguments.push(Argument {
                name: WithLocation::generated(*ARG_DERIVED_FROM),
                value: WithLocation::generated(Value::Constant(ConstantValue::String(
                    derived_from.0,
                ))),
            })
        }
        arguments.push(Argument {
            name: WithLocation::generated(*ARG_PARENT_DOCUMENTS),
            value: WithLocation::generated(Value::Constant(ConstantValue::List(
                self.parent_documents
                    .iter()
                    .cloned()
                    .map(ConstantValue::String)
                    .collect(),
            ))),
        });
        if self.raw_response_type {
            arguments.push(Argument {
                name: WithLocation::generated(*ARG_RAW_RESPONSE_TYPE),
                value: WithLocation::generated(Value::Constant(ConstantValue::Null())),
            });
        }
        Directive {
            name: WithLocation::new(self.location, *DIRECTIVE_SPLIT_OPERATION),
            arguments,
            data: None,
        }
    }
}

impl From<&Directive> for SplitOperationMetadata {
    fn from(directive: &Directive) -> Self {
        debug_assert!(directive.name.item == *DIRECTIVE_SPLIT_OPERATION);
        let location = directive.name.location;
        let derived_from_arg = directive.arguments.named(ARG_DERIVED_FROM.0);

        let derived_from = derived_from_arg.map(|derived_from_arg| {
            FragmentDefinitionName(derived_from_arg.value.item.expect_string_literal())
        });

        let parent_documents_arg = directive
            .arguments
            .named(ARG_PARENT_DOCUMENTS.0)
            .expect("Expected parent_documents arg to exist");
        let raw_response_type = directive.arguments.named(ARG_RAW_RESPONSE_TYPE.0).is_some();

        if let Value::Constant(ConstantValue::List(source_definition_names)) =
            &parent_documents_arg.value.item
        {
            let parent_documents = source_definition_names
                .iter()
                .map(|val| {
                    if let ConstantValue::String(name) = val {
                        name
                    } else {
                        panic!("Expected item in the parent sources to be a StringKey.")
                    }
                })
                .cloned()
                .collect();
            Self {
                derived_from,
                location,
                parent_documents,
                raw_response_type,
            }
        } else {
            panic!("Expected parent sources to be a constant of list.");
        }
    }
}
