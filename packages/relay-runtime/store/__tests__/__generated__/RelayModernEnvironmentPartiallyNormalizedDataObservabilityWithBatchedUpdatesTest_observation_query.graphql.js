/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f943792e9faae9dd205d0c38c1e36aef>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$fragmentType: FragmentType;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$ref = RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$fragmentType;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$data = {|
  +me: ?{|
    +name: ?string,
    +lastName: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$fragmentType,
|};
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query = RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$data;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$key = {
  +$data?: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$data,
  +$fragmentSpreads: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$fragmentType,
  RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTest_observation_query$data,
>*/);
