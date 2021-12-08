/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1c3047944384bde8bfd307d65cd93451>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type QueryResourceTest2Fragment$fragmentType = any;
export type QueryResourceTest4Query$variables = {|
  id: string,
|};
export type QueryResourceTest4QueryVariables = QueryResourceTest4Query$variables;
export type QueryResourceTest4Query$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: QueryResourceTest2Fragment$fragmentType,
  |},
|};
export type QueryResourceTest4QueryResponse = QueryResourceTest4Query$data;
export type QueryResourceTest4Query = {|
  variables: QueryResourceTest4QueryVariables,
  response: QueryResourceTest4Query$data,
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
    "name": "QueryResourceTest4Query",
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
            "name": "QueryResourceTest2Fragment"
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
    "name": "QueryResourceTest4Query",
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
    "cacheID": "6c5f7d87a3b7e7c3eb5e44b642310c1d",
    "id": null,
    "metadata": {},
    "name": "QueryResourceTest4Query",
    "operationKind": "query",
    "text": "query QueryResourceTest4Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...QueryResourceTest2Fragment\n    id\n  }\n}\n\nfragment QueryResourceTest2Fragment on User {\n  id\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f60bd73c9198b5edbb1b218d58b8828b";
}

module.exports = ((node/*: any*/)/*: Query<
  QueryResourceTest4Query$variables,
  QueryResourceTest4Query$data,
>*/);
