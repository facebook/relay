/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bf0a949babceaafd4dff4ec67e1400ca>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user {"branches":{"User":{"component":"User.react","fragment":"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_nestedModule_user$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_nestedModule_user$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$fragmentType: FragmentType;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$ref = RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$fragmentType;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$data = {|
  +__fragmentPropName: ?string,
  +__module_component: ?string,
  +name: ?string,
  +$fragmentSpreads: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_nestedModule_user$fragmentType,
  +$fragmentType: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$fragmentType,
|};
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user = RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$data;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$key = {
  +$data?: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$data,
  +$fragmentSpreads: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user",
  "selections": [
    {
      "args": null,
      "documentName": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user",
      "fragmentName": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_nestedModule_user",
      "fragmentPropName": "nestedModule_user",
      "kind": "ModuleImport"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "f20b231633d0a758a167ff1f400d0dee";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$fragmentType,
  RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$data,
>*/);
