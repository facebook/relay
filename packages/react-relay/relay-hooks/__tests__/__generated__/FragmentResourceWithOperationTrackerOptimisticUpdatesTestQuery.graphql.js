/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<43667d825dc762821b93c44a4fd2ece1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment$fragmentType } from "./FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment.graphql";
export type FragmentResourceWithOperationTrackerOptimisticUpdatesTestQuery$variables = {|
  id: string,
|};
export type FragmentResourceWithOperationTrackerOptimisticUpdatesTestQuery$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment$fragmentType,
  |},
|};
export type FragmentResourceWithOperationTrackerOptimisticUpdatesTestQuery = {|
  response: FragmentResourceWithOperationTrackerOptimisticUpdatesTestQuery$data,
  variables: FragmentResourceWithOperationTrackerOptimisticUpdatesTestQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FragmentResourceWithOperationTrackerOptimisticUpdatesTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FragmentResourceWithOperationTrackerOptimisticUpdatesTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "1e4b5355ae26c1d5586da76240492e10",
    "id": null,
    "metadata": {},
    "name": "FragmentResourceWithOperationTrackerOptimisticUpdatesTestQuery",
    "operationKind": "query",
    "text": "query FragmentResourceWithOperationTrackerOptimisticUpdatesTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "92ff47cf9f81c373192ab8d76a50f574";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceWithOperationTrackerOptimisticUpdatesTestQuery$variables,
  FragmentResourceWithOperationTrackerOptimisticUpdatesTestQuery$data,
>*/);
