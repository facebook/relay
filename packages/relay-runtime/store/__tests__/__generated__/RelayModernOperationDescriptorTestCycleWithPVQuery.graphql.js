/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<305bc4cb44edc8ea237917371c400367>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernOperationDescriptorTestCycleQuery_fragment$fragmentType } from "./RelayModernOperationDescriptorTestCycleQuery_fragment.graphql";
export type RelayModernOperationDescriptorTestCycleWithPVQuery$variables = {||};
export type RelayModernOperationDescriptorTestCycleWithPVQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayModernOperationDescriptorTestCycleQuery_fragment$fragmentType,
  |},
|};
export type RelayModernOperationDescriptorTestCycleWithPVQuery = {|
  response: RelayModernOperationDescriptorTestCycleWithPVQuery$data,
  variables: RelayModernOperationDescriptorTestCycleWithPVQuery$variables,
|};
({
  "__relay_internal__pv__RelayProvider_returnsCyclicrelayprovider": require('../RelayProvider_returnsCyclic.relayprovider')
}: {|
  +__relay_internal__pv__RelayProvider_returnsCyclicrelayprovider: {|
    +get: () => boolean,
  |},
|});
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernOperationDescriptorTestCycleWithPVQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernOperationDescriptorTestCycleQuery_fragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__relay_internal__pv__RelayProvider_returnsCyclicrelayprovider"
      }
    ],
    "kind": "Operation",
    "name": "RelayModernOperationDescriptorTestCycleWithPVQuery",
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
            "condition": "__relay_internal__pv__RelayProvider_returnsCyclicrelayprovider",
            "kind": "Condition",
            "passingValue": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ]
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ea70e6b90d4e88162ad04c15acc71e3d",
    "id": null,
    "metadata": {},
    "name": "RelayModernOperationDescriptorTestCycleWithPVQuery",
    "operationKind": "query",
    "text": "query RelayModernOperationDescriptorTestCycleWithPVQuery(\n  $__relay_internal__pv__RelayProvider_returnsCyclicrelayprovider: Boolean!\n) {\n  me {\n    ...RelayModernOperationDescriptorTestCycleQuery_fragment\n    id\n  }\n}\n\nfragment RelayModernOperationDescriptorTestCycleQuery_fragment on User {\n  name @include(if: $__relay_internal__pv__RelayProvider_returnsCyclicrelayprovider)\n}\n",
    "providedVariables": {
      "__relay_internal__pv__RelayProvider_returnsCyclicrelayprovider": require('../RelayProvider_returnsCyclic.relayprovider')
    }
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "6f13180b64777a29cc0fd27356525b7a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernOperationDescriptorTestCycleWithPVQuery$variables,
  RelayModernOperationDescriptorTestCycleWithPVQuery$data,
>*/);
