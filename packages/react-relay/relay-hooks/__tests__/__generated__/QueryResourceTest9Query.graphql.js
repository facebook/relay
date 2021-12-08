/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1ac8211ab0c0fc6dee8b3c6593c4c09c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type QueryResourceTest9Query$variables = {|
  id: string,
|};
export type QueryResourceTest9QueryVariables = QueryResourceTest9Query$variables;
export type QueryResourceTest9Query$data = {|
  +node: ?{|
    +id?: string,
  |},
|};
export type QueryResourceTest9QueryResponse = QueryResourceTest9Query$data;
export type QueryResourceTest9Query = {|
  variables: QueryResourceTest9QueryVariables,
  response: QueryResourceTest9Query$data,
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
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "QueryResourceTest9Query",
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
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/)
            ],
            "type": "User",
            "abstractKey": null
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
    "name": "QueryResourceTest9Query",
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
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d97c3db33d6fe1e3a04b890e83d3935e",
    "id": null,
    "metadata": {},
    "name": "QueryResourceTest9Query",
    "operationKind": "query",
    "text": "query QueryResourceTest9Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      id\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "94aed4d9aea7df74dd4418bfd32a48bc";
}

module.exports = ((node/*: any*/)/*: Query<
  QueryResourceTest9Query$variables,
  QueryResourceTest9Query$data,
>*/);
