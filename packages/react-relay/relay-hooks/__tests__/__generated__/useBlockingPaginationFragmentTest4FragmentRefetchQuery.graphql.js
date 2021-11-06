/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6ac6476270cc0c14fd70e2f119e4bf7f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useBlockingPaginationFragmentTest4Fragment$ref: FragmentReference;
declare export opaque type useBlockingPaginationFragmentTest4Fragment$fragmentType: useBlockingPaginationFragmentTest4Fragment$ref;
export type useBlockingPaginationFragmentTest4FragmentRefetchQueryVariables = {|
  id: string,
|};
export type useBlockingPaginationFragmentTest4FragmentRefetchQueryResponse = {|
  +node: ?{|
    +$fragmentRefs: useBlockingPaginationFragmentTest4Fragment$ref,
  |},
|};
export type useBlockingPaginationFragmentTest4FragmentRefetchQuery = {|
  variables: useBlockingPaginationFragmentTest4FragmentRefetchQueryVariables,
  response: useBlockingPaginationFragmentTest4FragmentRefetchQueryResponse,
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

module.exports = node;
