/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{NamedItem, WithLocation};
use fnv::FnvHashSet;
use graphql_ir::{Argument, ConstantValue, Directive, Value};
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;

lazy_static! {
    pub static ref DIRECTIVE_SPLIT_OPERATION: StringKey = "__splitOperation".intern();
    static ref ARG_DERIVED_FROM: StringKey = "derivedFrom".intern();
    static ref ARG_PARENT_DOCUMENTS: StringKey = "parentDocuments".intern();
    static ref ARG_RAW_RESPONSE_TYPE: StringKey = "rawResponseType".intern();
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
    pub derived_from: StringKey,

    /// The names of the fragments and operations that included this fragment.
    /// They are the reason this split operation exist. If they are all removed,
    /// this file also needs to be removed.
    pub parent_documents: FnvHashSet<StringKey>,

    /// Should a @raw_response_type style type be generated.
    pub raw_response_type: bool,
}

impl SplitOperationMetadata {
    pub fn to_directive(&self) -> Directive {
        let mut arguments = vec![
            Argument {
                name: WithLocation::generated(*ARG_DERIVED_FROM),
                value: WithLocation::generated(Value::Constant(ConstantValue::String(
                    self.derived_from,
                ))),
            },
            Argument {
                name: WithLocation::generated(*ARG_PARENT_DOCUMENTS),
                value: WithLocation::generated(Value::Constant(ConstantValue::List(
                    self.parent_documents
                        .iter()
                        .cloned()
                        .map(ConstantValue::String)
                        .collect(),
                ))),
            },
        ];
        if self.raw_response_type {
            arguments.push(Argument {
                name: WithLocation::generated(*ARG_RAW_RESPONSE_TYPE),
                value: WithLocation::generated(Value::Constant(ConstantValue::Null())),
            });
        }
        Directive {
            name: WithLocation::generated(*DIRECTIVE_SPLIT_OPERATION),
            arguments,
            data: None,
        }
    }
}

impl From<&Directive> for SplitOperationMetadata {
    fn from(directive: &Directive) -> Self {
        debug_assert!(directive.name.item == *DIRECTIVE_SPLIT_OPERATION);
        let derived_from_arg = directive
            .arguments
            .named(*ARG_DERIVED_FROM)
            .expect("Expected derived_from arg to exist");
        let derived_from = derived_from_arg.value.item.expect_string_literal();
        let parent_documents_arg = directive
            .arguments
            .named(*ARG_PARENT_DOCUMENTS)
            .expect("Expected parent_documents arg to exist");
        let raw_response_type = directive.arguments.named(*ARG_RAW_RESPONSE_TYPE).is_some();

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
                parent_documents,
                raw_response_type,
            }
        } else {
            panic!("Expected parent sources to be a constant of list.");
        }
    }
}
