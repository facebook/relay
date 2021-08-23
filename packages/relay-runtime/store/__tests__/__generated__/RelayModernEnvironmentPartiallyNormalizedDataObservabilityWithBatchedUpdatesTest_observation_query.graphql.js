/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8f154a65ac9b8ddfd7ce2f747200dc4b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$fragmentType: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$ref;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query = {|
  +me: ?{|
    +name: ?string,
    +lastName: ?string,
  |},
  +$refType: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$ref,
|};
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$data = RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$key = {
  +$data?: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$data,
  +$fragmentRefs: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "me",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "lastName",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "077caa909a110ad435aa910b2449182c";
}

module.exports = node;
