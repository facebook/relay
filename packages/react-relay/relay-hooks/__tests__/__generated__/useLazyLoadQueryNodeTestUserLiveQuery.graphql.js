/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0a6b9599d79748694f4a358e93246fc0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type useLazyLoadQueryNodeTestUserLiveQuery$variables = {|
  id?: ?string,
|};
export type useLazyLoadQueryNodeTestUserLiveQuery$data = {|
  +node: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type useLazyLoadQueryNodeTestUserLiveQuery = {|
  response: useLazyLoadQueryNodeTestUserLiveQuery$data,
  variables: useLazyLoadQueryNodeTestUserLiveQuery$variables,
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
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useLazyLoadQueryNodeTestUserLiveQuery",
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
          (v3/*: any*/)
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
    "name": "useLazyLoadQueryNodeTestUserLiveQuery",
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
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "98600f06e5e443016716645b4cb89c38",
    "id": null,
    "metadata": {
      "live": {
        "polling_interval": 10000
      }
    },
    "name": "useLazyLoadQueryNodeTestUserLiveQuery",
    "operationKind": "query",
    "text": "query useLazyLoadQueryNodeTestUserLiveQuery(\n  $id: ID\n) @live_query(polling_interval: 10000) {\n  node(id: $id) {\n    __typename\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d4cd3d6c368c829da68df929e577f449";
}

module.exports = ((node/*: any*/)/*: Query<
  useLazyLoadQueryNodeTestUserLiveQuery$variables,
  useLazyLoadQueryNodeTestUserLiveQuery$data,
>*/);
