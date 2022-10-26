/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<80dba3b9be348a4607bf52e6c107eef7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import type { useBlockingPaginationFragmentTest4Fragment$fragmentType } from "./useBlockingPaginationFragmentTest4Fragment.graphql";
export type useBlockingPaginationFragmentTest4FragmentRefetchQuery$variables = {|
  id: string,
|};
export type useBlockingPaginationFragmentTest4FragmentRefetchQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useBlockingPaginationFragmentTest4Fragment$fragmentType,
  |},
|};
export type useBlockingPaginationFragmentTest4FragmentRefetchQuery = {|
  response: useBlockingPaginationFragmentTest4FragmentRefetchQuery$data,
  variables: useBlockingPaginationFragmentTest4FragmentRefetchQuery$variables,
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useBlockingPaginationFragmentTest4FragmentRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useBlockingPaginationFragmentTest4Fragment"
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
    "name": "useBlockingPaginationFragmentTest4FragmentRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
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
    "cacheID": "b2e24c8bd247515a2d83c28a16a51315",
    "id": null,
    "metadata": {},
    "name": "useBlockingPaginationFragmentTest4FragmentRefetchQuery",
    "operationKind": "query",
    "text": "query useBlockingPaginationFragmentTest4FragmentRefetchQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useBlockingPaginationFragmentTest4Fragment\n    id\n  }\n}\n\nfragment useBlockingPaginationFragmentTest4Fragment on User {\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "43246af9f06d0dfe5df218b7d05f131c";
}

module.exports = ((node/*: any*/)/*: Query<
  useBlockingPaginationFragmentTest4FragmentRefetchQuery$variables,
  useBlockingPaginationFragmentTest4FragmentRefetchQuery$data,
>*/);
