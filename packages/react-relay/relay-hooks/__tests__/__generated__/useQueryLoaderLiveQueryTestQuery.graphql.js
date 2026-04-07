/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c2094d8a3cca3fd8a83772d1373979a8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type useQueryLoaderLiveQueryTestQuery$variables = {|
  id: string,
|};
export type useQueryLoaderLiveQueryTestQuery$data = {|
  +node: ?{|
    +id: string,
  |},
|};
export type useQueryLoaderLiveQueryTestQuery = {|
  response: useQueryLoaderLiveQueryTestQuery$data,
  variables: useQueryLoaderLiveQueryTestQuery$variables,
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useQueryLoaderLiveQueryTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "useQueryLoaderLiveQueryTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
          (v2/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b6e95f5644821fd013fd0e47d14d2000",
    "id": null,
    "metadata": {
      "live": {
        "polling_interval": 10000
      }
    },
    "name": "useQueryLoaderLiveQueryTestQuery",
    "operationKind": "query",
    "text": "query useQueryLoaderLiveQueryTestQuery(\n  $id: ID!\n) @client_polling(interval: 10000) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "9405db015f9f799670fa950c59126e04";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  useQueryLoaderLiveQueryTestQuery$variables,
  useQueryLoaderLiveQueryTestQuery$data,
>*/);
