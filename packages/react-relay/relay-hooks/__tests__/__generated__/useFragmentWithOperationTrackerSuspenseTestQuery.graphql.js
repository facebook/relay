/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3c807f2294b482947010f72e07e490a2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useFragmentWithOperationTrackerSuspenseTestFragment$fragmentType } from "./useFragmentWithOperationTrackerSuspenseTestFragment.graphql";
export type useFragmentWithOperationTrackerSuspenseTestQuery$variables = {|
  id: string,
|};
export type useFragmentWithOperationTrackerSuspenseTestQuery$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: useFragmentWithOperationTrackerSuspenseTestFragment$fragmentType,
  |},
|};
export type useFragmentWithOperationTrackerSuspenseTestQuery = {|
  response: useFragmentWithOperationTrackerSuspenseTestQuery$data,
  variables: useFragmentWithOperationTrackerSuspenseTestQuery$variables,
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
    "name": "useFragmentWithOperationTrackerSuspenseTestQuery",
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
            "name": "useFragmentWithOperationTrackerSuspenseTestFragment"
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
    "name": "useFragmentWithOperationTrackerSuspenseTestQuery",
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
    "cacheID": "71ebeb7db09a62e0d966856af3751c81",
    "id": null,
    "metadata": {},
    "name": "useFragmentWithOperationTrackerSuspenseTestQuery",
    "operationKind": "query",
    "text": "query useFragmentWithOperationTrackerSuspenseTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useFragmentWithOperationTrackerSuspenseTestFragment\n    id\n  }\n}\n\nfragment useFragmentWithOperationTrackerSuspenseTestFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d21e697bfd19cd686c5039c4a5d8d27f";
}

module.exports = ((node/*: any*/)/*: Query<
  useFragmentWithOperationTrackerSuspenseTestQuery$variables,
  useFragmentWithOperationTrackerSuspenseTestQuery$data,
>*/);
