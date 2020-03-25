/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::FnvHashMap;
use interner::StringKey;
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
    pub id: Option<String>,
    pub metadata: FnvHashMap<String, String>,
    pub name: StringKey,
    pub operation_kind: ConcreteOperationKind,
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
    pub name: StringKey,
    pub argument_definitions: Vec<ConcreteVariableDefinition>,
    pub selections: Vec<ConcreteSelection>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteFragment {
    pub name: StringKey,
    #[serde(rename(serialize = "type"))]
    pub type_: StringKey,
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
    pub refetch: Option<RefetchableMetadata>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RefetchableFragmentMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub connection: Option<(ConnectionMetadata,)>,
    pub refetch: RefetchableMetadata,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RefetchableMetadata {
    pub connection: Option<PaginationMetadata>,
    pub operation: Box<ConcreteRequest>,
    pub fragment_path_in_result: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RefetchablePaginationFragmentMetadata {
    pub connection: (ConnectionMetadata,),
    pub refetch: RefetchablePaginationMetadata,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RefetchablePaginationMetadata {
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
    pub path: Option<Vec<StringKey>>,
    pub direction: Option<StringKey>,
    pub cursor: Option<StringKey>,
    pub count: Option<StringKey>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
}

#[derive(Debug, Serialize)]
#[serde(tag = "kind")]
pub enum ConcreteSelection {
    Condition(ConcreteCondition),
    FragmentSpread(ConcreteFragmentSpread),
    InlineFragment(ConcreteInlineFragment),
    LinkedField(ConcreteLinkedField),
    ScalarField(ConcreteScalarField),
    ClientExtension(ConcreteClientExtension),
    ScalarHandle(ConcreteNormalizationScalarHandle),
    LinkedHandle(ConcreteNormalizationLinkedHandle),
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteCondition {
    pub passing_value: bool,
    pub condition: StringKey,
    pub selections: Vec<ConcreteSelection>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteFragmentSpread {
    pub name: StringKey,
    pub args: Option<Vec<ConcreteArgument>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteInlineFragment {
    #[serde(rename(serialize = "type"))]
    pub type_: StringKey,
    pub selections: Vec<ConcreteSelection>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteLinkedField {
    pub alias: Option<StringKey>,
    pub name: StringKey,
    pub args: Option<Vec<ConcreteArgument>>,
    pub concrete_type: Option<StringKey>,
    pub plural: bool,
    pub selections: Vec<ConcreteSelection>,
    pub storage_key: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteScalarField {
    pub alias: Option<StringKey>,
    pub name: StringKey,
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
    pub alias: Option<StringKey>,
    pub name: StringKey,
    pub args: Option<Vec<ConcreteArgument>>,
    pub handle: StringKey,
    pub key: StringKey,
    pub filters: Option<Vec<StringKey>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteNormalizationLinkedHandle {
    pub alias: Option<StringKey>,
    pub name: StringKey,
    pub args: Option<Vec<ConcreteArgument>>,
    pub handle: StringKey,
    pub key: StringKey,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dynamic_key: Option<ConcreteArgument>,
    pub filters: Option<Vec<StringKey>>,
}

#[derive(Debug, Serialize)]
#[serde(tag = "kind")]
pub enum ConcreteVariableDefinition {
    RootArgument(ConcreteGlobalVariableDefinition),
    LocalArgument(ConcreteLocalVariableDefinition),
}

impl ConcreteVariableDefinition {
    pub fn name(&self) -> StringKey {
        match self {
            ConcreteVariableDefinition::RootArgument(var_def) => var_def.name,
            ConcreteVariableDefinition::LocalArgument(var_def) => var_def.name,
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteGlobalVariableDefinition {
    pub name: StringKey,
    #[serde(rename(serialize = "type"))]
    pub type_: StringKey,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteLocalVariableDefinition {
    pub name: StringKey,
    #[serde(rename(serialize = "type"))]
    pub type_: StringKey,
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
    pub fn name(&self) -> StringKey {
        match self {
            ConcreteArgument::Literal(arg) => arg.name,
            ConcreteArgument::Variable(arg) => arg.name,
            ConcreteArgument::ObjectValue(arg) => arg.name,
            ConcreteArgument::ListValue(arg) => arg.name,
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteLiteralArgument {
    pub name: StringKey,
    #[serde(rename(serialize = "type"))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub type_: Option<String>,
    pub value: SerdeValue,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteListArgument {
    pub name: StringKey,
    pub items: Vec<Option<ConcreteArgument>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteObjectArgument {
    pub name: StringKey,
    pub fields: Vec<ConcreteArgument>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcreteVariableArgument {
    pub name: StringKey,
    #[serde(rename(serialize = "type"))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub type_: Option<String>,
    pub variable_name: StringKey,
}
