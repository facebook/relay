/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::{Intern, StringKey};
use lazy_static::lazy_static;

pub struct CodegenConstants {
    pub alias: StringKey,
    pub args: StringKey,
    pub argument_definitions: StringKey,
    pub concrete_type: StringKey,
    pub condition: StringKey,
    pub condition_value: StringKey,
    pub default_value: StringKey,
    pub derived_from: StringKey,
    pub dynamic_key: StringKey,
    pub fields: StringKey,
    pub filters: StringKey,
    pub handle: StringKey,
    pub items: StringKey,
    pub key: StringKey,
    pub kind: StringKey,
    pub linked_field: StringKey,
    pub list_value: StringKey,
    pub literal: StringKey,
    pub local_argument: StringKey,
    pub metadata: StringKey,
    pub name: StringKey,
    pub object_value: StringKey,
    pub operation: StringKey,
    pub passing_value: StringKey,
    pub plural: StringKey,
    pub scalar_field: StringKey,
    pub selections: StringKey,
    pub split_operation: StringKey,
    pub storage_key: StringKey,
    pub type_: StringKey,
    pub value: StringKey,
    pub variable_name: StringKey,
    pub variable: StringKey,
}

impl Default for CodegenConstants {
    fn default() -> Self {
        Self {
            alias: "alias".intern(),
            args: "args".intern(),
            argument_definitions: "argumentDefinitions".intern(),
            concrete_type: "concreteType".intern(),
            condition: "condition".intern(),
            condition_value: "Condition".intern(),
            default_value: "defaultValue".intern(),
            derived_from: "derivedFrom".intern(),
            dynamic_key: "dynamicKey".intern(),
            fields: "fields".intern(),
            filters: "filters".intern(),
            handle: "handle".intern(),
            items: "items".intern(),
            key: "key".intern(),
            kind: "kind".intern(),
            linked_field: "LinkedField".intern(),
            list_value: "ListValue".intern(),
            literal: "Literal".intern(),
            local_argument: "LocalArgument".intern(),
            metadata: "metadata".intern(),
            name: "name".intern(),
            object_value: "ObjectValue".intern(),
            operation: "Operation".intern(),
            passing_value: "passingValue".intern(),
            plural: "plural".intern(),
            scalar_field: "ScalarField".intern(),
            selections: "selections".intern(),
            split_operation: "SplitOperation".intern(),
            storage_key: "storageKey".intern(),
            type_: "type".intern(),
            value: "value".intern(),
            variable_name: "variableName".intern(),
            variable: "Variable".intern(),
        }
    }
}

lazy_static! {
    pub static ref CODEGEN_CONSTANTS: CodegenConstants = Default::default();
}
