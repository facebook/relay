/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7192c844a74388c867140b96e638ffc6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type FragmentResourceTest2Fragment$fragmentType = any;
export type FragmentResourceTest2Query$variables = {|
  id: string,
|};
export type FragmentResourceTest2QueryVariables = FragmentResourceTest2Query$variables;
export type FragmentResourceTest2Query$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: FragmentResourceTest2Fragment$fragmentType,
  |},
|};
export type FragmentResourceTest2QueryResponse = FragmentResourceTest2Query$data;
export type FragmentResourceTest2Query = {|
  variables: FragmentResourceTest2QueryVariables,
  response: FragmentResourceTest2Query$data,
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
    "name": "FragmentResourceTest2Query",
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
            "name": "FragmentResourceTest2Fragment"
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
    "name": "FragmentResourceTest2Query",
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
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "username",
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
    "cacheID": "77fdf4a8003d9575215d1951f7f569f1",
    "id": null,
    "metadata": {},
    "name": "FragmentResourceTest2Query",
    "operationKind": "query",
    "text": "query FragmentResourceTest2Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...FragmentResourceTest2Fragment\n    id\n  }\n}\n\nfragment FragmentResourceTest2Fragment on User {\n  id\n  name\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9485c8a47f2c7a7fa324c0997ffc6869";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceTest2Query$variables,
  FragmentResourceTest2Query$data,
>*/);
