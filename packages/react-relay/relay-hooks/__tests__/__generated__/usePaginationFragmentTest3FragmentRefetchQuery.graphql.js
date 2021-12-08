/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<336ac8d29b45a7323f56887f8e88d736>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
type usePaginationFragmentTest3Fragment$fragmentType = any;
export type usePaginationFragmentTest3FragmentRefetchQuery$variables = {|
  id: string,
|};
export type usePaginationFragmentTest3FragmentRefetchQueryVariables = usePaginationFragmentTest3FragmentRefetchQuery$variables;
export type usePaginationFragmentTest3FragmentRefetchQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: usePaginationFragmentTest3Fragment$fragmentType,
  |},
|};
export type usePaginationFragmentTest3FragmentRefetchQueryResponse = usePaginationFragmentTest3FragmentRefetchQuery$data;
export type usePaginationFragmentTest3FragmentRefetchQuery = {|
  variables: usePaginationFragmentTest3FragmentRefetchQueryVariables,
  response: usePaginationFragmentTest3FragmentRefetchQuery$data,
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
    "name": "usePaginationFragmentTest3FragmentRefetchQuery",
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
            "name": "usePaginationFragmentTest3Fragment"
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
    "name": "usePaginationFragmentTest3FragmentRefetchQuery",
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
    "cacheID": "60dbe0c4ec9730fbec4c13f8fbeeb9ab",
    "id": null,
    "metadata": {},
    "name": "usePaginationFragmentTest3FragmentRefetchQuery",
    "operationKind": "query",
    "text": "query usePaginationFragmentTest3FragmentRefetchQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...usePaginationFragmentTest3Fragment\n    id\n  }\n}\n\nfragment usePaginationFragmentTest3Fragment on User {\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b7e65e1c3646e22d52de26d24bb8c2a9";
}

module.exports = ((node/*: any*/)/*: Query<
  usePaginationFragmentTest3FragmentRefetchQuery$variables,
  usePaginationFragmentTest3FragmentRefetchQuery$data,
>*/);
