/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5310be484aea1f45ad806843866cbd7d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type QueryResourceTest6Fragment$fragmentType = any;
export type QueryResourceTest8Query$variables = {|
  id: string,
|};
export type QueryResourceTest8QueryVariables = QueryResourceTest8Query$variables;
export type QueryResourceTest8Query$data = {|
  +node: ?{|
    +__typename: string,
    +id: string,
    +$fragmentSpreads: QueryResourceTest6Fragment$fragmentType,
  |},
|};
export type QueryResourceTest8QueryResponse = QueryResourceTest8Query$data;
export type QueryResourceTest8Query = {|
  variables: QueryResourceTest8QueryVariables,
  response: QueryResourceTest8Query$data,
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
},
v3 = {
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
    "name": "QueryResourceTest8Query",
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
          (v3/*: any*/),
          {
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "QueryResourceTest6Fragment"
              }
            ]
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
    "name": "QueryResourceTest8Query",
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
          (v3/*: any*/),
          {
            "if": null,
            "kind": "Defer",
            "label": "QueryResourceTest8Query$defer$QueryResourceTest6Fragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v3/*: any*/),
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
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c3998d7e64783ffd347a298a56edfa6f",
    "id": null,
    "metadata": {},
    "name": "QueryResourceTest8Query",
    "operationKind": "query",
    "text": "query QueryResourceTest8Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...QueryResourceTest6Fragment @defer(label: \"QueryResourceTest8Query$defer$QueryResourceTest6Fragment\")\n  }\n}\n\nfragment QueryResourceTest6Fragment on User {\n  id\n  username\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6e87df11edb8826c7aad49628ee3bb71";
}

module.exports = ((node/*: any*/)/*: Query<
  QueryResourceTest8Query$variables,
  QueryResourceTest8Query$data,
>*/);
