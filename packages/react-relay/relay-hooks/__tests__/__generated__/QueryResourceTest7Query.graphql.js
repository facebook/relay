/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b4c2ea650dbc87b180e877d34a5b4c58>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type QueryResourceTest5Fragment$fragmentType = any;
export type QueryResourceTest7Query$variables = {|
  id: string,
|};
export type QueryResourceTest7QueryVariables = QueryResourceTest7Query$variables;
export type QueryResourceTest7Query$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: QueryResourceTest5Fragment$fragmentType,
  |},
|};
export type QueryResourceTest7QueryResponse = QueryResourceTest7Query$data;
export type QueryResourceTest7Query = {|
  variables: QueryResourceTest7QueryVariables,
  response: QueryResourceTest7Query$data,
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
    "name": "QueryResourceTest7Query",
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
            "name": "QueryResourceTest5Fragment"
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
    "name": "QueryResourceTest7Query",
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
    "cacheID": "16fee9ca0254fe5e0b1fe85b602278b5",
    "id": null,
    "metadata": {},
    "name": "QueryResourceTest7Query",
    "operationKind": "query",
    "text": "query QueryResourceTest7Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...QueryResourceTest5Fragment\n    id\n  }\n}\n\nfragment QueryResourceTest5Fragment on User {\n  id\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bf937ab1046354c4b80e3a07597b4bfa";
}

module.exports = ((node/*: any*/)/*: Query<
  QueryResourceTest7Query$variables,
  QueryResourceTest7Query$data,
>*/);
