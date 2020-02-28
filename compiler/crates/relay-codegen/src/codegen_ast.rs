/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::FnvHashMap;
use serde::Serialize;
use serde_json::Value as SerdeValue;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteRequest {
    pub kind: &'static str,
    pub fragment: ConcreteDefinition,
    pub operation: ConcreteDefinition,
    pub params: RequestParameters,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestParameters {
    pub name: &'static str,
    pub operation_kind: ConcreteOperationKind,
    pub metadata: FnvHashMap<String, String>,
    pub id: Option<String>,
    pub text: Option<String>,
}

#[derive(Debug, Serialize)]
pub enum ConcreteOperationKind {
    #[serde(rename(serialize = "query"))]
    Query,
    #[serde(rename(serialize = "mutation"))]
    Mutation,
    #[serde(rename(serialize = "subscription"))]
    Subscription,
}

#[derive(Debug, Serialize)]
#[serde(tag = "kind")]
pub enum ConcreteDefinition {
    Operation(ConcreteOperation),
    Fragment(ConcreteFragment),
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteOperation {
    pub name: &'static str,
    pub argument_definitions: Vec<ConcreteVariableDefinition>,
    pub selections: Vec<ConcreteSelection>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteFragment {
    pub name: &'static str,
    #[serde(rename(serialize = "type"))]
    pub type_: &'static str,
    pub metadata: Option<FragmentMetadata>,
    pub argument_definitions: Vec<ConcreteVariableDefinition>,
    pub selections: Vec<ConcreteSelection>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FragmentMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub connection: Option<Vec<ConnectionMetadata>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mask: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plural: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub refetch: Option<RefetchMetadata>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RefetchableFragmentMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub connection: Option<(ConnectionMetadata,)>,
    pub refetch: RefetchMetadata,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginationFragmentMetadata {
    pub connection: (ConnectionMetadata,),
    pub refetch: RefetchPaginationMetadata,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RefetchMetadata {
    pub connection: Option<PaginationMetadata>,
    pub operation: Box<ConcreteRequest>,
    pub fragment_path_in_result: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RefetchPaginationMetadata {
    pub connection: PaginationMetadata,
    pub operation: Box<ConcreteRequest>,
    pub fragment_path_in_result: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginationMetadata {
    pub backward: Option<PageInfoMetadata>,
    pub forward: Option<PageInfoMetadata>,
    pub path: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PageInfoMetadata {
    pub cursor: String,
    pub count: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionMetadata {
    pub path: Option<Vec<String>>,
    pub direction: Option<ConnectionDirection>,
    pub cursor: Option<String>,
    pub count: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<String>,
}

#[derive(Debug, Serialize)]
#[allow(dead_code)]
pub enum ConnectionDirection {
    #[serde(rename(serialize = "forward"))]
    Forward,
    #[serde(rename(serialize = "backward"))]
    Backward,
    #[serde(rename(serialize = "bidirectional"))]
    Bidirectional,
}

#[derive(Debug, Serialize)]
#[serde(tag = "kind")]
#[allow(dead_code)]
pub enum ConcreteSelection {
    Condition(ConcreteCondition),
    FragmentSpread(ConcreteFragmentSpread),
    InlineFragment(ConcreteInlineFragment),
    LinkedField(ConcreteLinkedField),
    ScalarField(ConcreteScalarField),
    ClientExtension(ConcreteClientExtension),
    ScalarHandle(ConcreteNormalizationScalarHandle),
    LinkedHandle(ConcreteNormalizationLinkedHandle),
    // TODO other selection types
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteCondition {
    pub passing_value: bool,
    pub condition: &'static str,
    pub selections: Vec<ConcreteSelection>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteFragmentSpread {
    pub name: &'static str,
    pub args: Option<Vec<ConcreteArgument>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteInlineFragment {
    #[serde(rename(serialize = "type"))]
    pub type_: &'static str,
    pub selections: Vec<ConcreteSelection>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteLinkedField {
    pub alias: Option<&'static str>,
    pub name: &'static str,
    pub args: Option<Vec<ConcreteArgument>>,
    pub concrete_type: Option<&'static str>,
    pub plural: bool,
    pub selections: Vec<ConcreteSelection>,
    pub storage_key: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteScalarField {
    pub alias: Option<&'static str>,
    pub name: &'static str,
    pub args: Option<Vec<ConcreteArgument>>,
    pub storage_key: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteClientExtension {
    pub selections: Vec<ConcreteSelection>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteNormalizationScalarHandle {
    pub alias: Option<&'static str>,
    pub name: &'static str,
    pub args: Option<Vec<ConcreteArgument>>,
    pub handle: &'static str,
    pub key: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dynamic_key: Option<ConcreteArgument>,
    pub filters: Option<Vec<String>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteNormalizationLinkedHandle {
    pub alias: Option<&'static str>,
    pub name: &'static str,
    pub args: Option<Vec<ConcreteArgument>>,
    pub handle: &'static str,
    pub key: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dynamic_key: Option<ConcreteArgument>,
    pub filters: Option<Vec<String>>,
}
#[derive(Debug, Serialize)]
#[serde(tag = "kind")]
pub enum ConcreteVariableDefinition {
    RootArgument(ConcreteGlobalVariableDefinition),
    LocalArgument(ConcreteLocalVariableDefinition),
}
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteGlobalVariableDefinition {
    pub name: &'static str,
    #[serde(rename(serialize = "type"))]
    pub type_: &'static str,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteLocalVariableDefinition {
    pub name: &'static str,
    #[serde(rename(serialize = "type"))]
    pub type_: &'static str,
    pub default_value: SerdeValue,
}

#[derive(Debug, Serialize)]
#[serde(tag = "kind")]
pub enum ConcreteArgument {
    Literal(ConcreteLiteralArgument),
    Variable(ConcreteVariableArgument),
    ObjectValue(ConcreteObjectArgument),
    ListValue(ConcreteListArgument),
}

impl ConcreteArgument {
    pub fn name(&self) -> &'static str {
        match self {
            ConcreteArgument::Literal(arg) => &arg.name,
            ConcreteArgument::Variable(arg) => &arg.name,
            ConcreteArgument::ObjectValue(arg) => &arg.name,
            ConcreteArgument::ListValue(arg) => &arg.name,
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteLiteralArgument {
    pub name: &'static str,
    #[serde(rename(serialize = "type"))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub type_: Option<String>,
    pub value: SerdeValue,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteListArgument {
    pub name: &'static str,
    pub items: Vec<Option<ConcreteArgument>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteObjectArgument {
    pub name: &'static str,
    pub fields: Vec<ConcreteArgument>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteVariableArgument {
    pub name: &'static str,
    #[serde(rename(serialize = "type"))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub type_: Option<String>,
    pub variable_name: &'static str,
}
