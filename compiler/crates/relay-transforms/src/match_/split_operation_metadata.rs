/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::hash::Hash;

use common::ArgumentName;
use common::DirectiveName;
use common::Location;
use graphql_ir::ExecutableDefinitionName;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::associated_data_impl;
use intern::string_key::Intern;
use lazy_static::lazy_static;
use rustc_hash::FxHashSet;

lazy_static! {
    pub static ref DIRECTIVE_SPLIT_OPERATION: DirectiveName =
        SplitOperationMetadata::directive_name();
    static ref ARG_DERIVED_FROM: ArgumentName = ArgumentName("derivedFrom".intern());
    static ref ARG_PARENT_DOCUMENTS: ArgumentName = ArgumentName("parentDocuments".intern());
    static ref ARG_RAW_RESPONSE_TYPE: ArgumentName = ArgumentName("rawResponseType".intern());
    static ref ARG_RAW_RESPONSE_TYPE_STRICT: ArgumentName =
        ArgumentName("rawResponseTypeStrict".intern());
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
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SplitOperationMetadata {
    /// Name of the fragment that this split operation represents. This is used
    /// to determine the name of the generated artifact.
    pub derived_from: Option<FragmentDefinitionName>,

    /// Location of the source file for this split operation
    pub location: Location,

    /// The names of the fragments and operations that included this fragment.
    /// They are the reason this split operation exists. If they are all removed,
    /// this file also needs to be removed.
    pub parent_documents: FxHashSet<ExecutableDefinitionName>,

    /// Should a @raw_response_type style type be generated.
    pub raw_response_type_generation_mode: Option<RawResponseGenerationMode>,
}

// associated_data_impl requires Hash, and we cannot derive Hash since HashSet iteration
// order is unstable.
impl Hash for SplitOperationMetadata {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        // We should only have a single SplitOperationMetadata per unique derived_from or
        // location. In addition, Hash implementations only requires this property.
        //   k1 == k2 -> hash(k1) == hash(k2)
        self.derived_from.hash(state);
        self.location.hash(state);
    }
}

associated_data_impl!(SplitOperationMetadata);

/// For split operations. This will define the mode for the type generation of RawResponse type
/// With Relay resolvers we may need to require all keys to be presented in the response shape.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum RawResponseGenerationMode {
    /// All keys are optional
    AllFieldsOptional,
    /// All keys in the raw response type are required
    /// (values can still be optional, based on the schema type)
    AllFieldsRequired,
}
