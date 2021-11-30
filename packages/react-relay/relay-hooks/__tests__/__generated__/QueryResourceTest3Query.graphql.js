/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c0c10b9f4ab5f0dc7d6181c9f49926f8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type QueryResourceTest1Fragment$fragmentType = any;
export type QueryResourceTest3Query$variables = {|
  id: string,
|};
export type QueryResourceTest3QueryVariables = QueryResourceTest3Query$variables;
export type QueryResourceTest3Query$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: QueryResourceTest1Fragment$fragmentType,
  |},
|};
export type QueryResourceTest3QueryResponse = QueryResourceTest3Query$data;
export type QueryResourceTest3Query = {|
  variables: QueryResourceTest3QueryVariables,
  response: QueryResourceTest3Query$data,
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
    "name": "QueryResourceTest3Query",
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
            "name": "QueryResourceTest1Fragment"
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
    "name": "QueryResourceTest3Query",
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "798426d53d069a1bda1447f19d805a05",
    "id": null,
    "metadata": {},
    "name": "QueryResourceTest3Query",
    "operationKind": "query",
    "text": "query QueryResourceTest3Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...QueryResourceTest1Fragment\n    id\n  }\n}\n\nfragment QueryResourceTest1Fragment on User {\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0cdada5db8e942ed6d118885802edcc4";
}

module.exports = ((node/*: any*/)/*: Query<
  QueryResourceTest3Query$variables,
  QueryResourceTest3Query$data,
>*/);
