/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<48102b078979f827d0fd540c7d20a322>>
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
export type useQueryLoaderLiveQueryTestQueryVariables = useQueryLoaderLiveQueryTestQuery$variables;
export type useQueryLoaderLiveQueryTestQuery$data = {|
  +node: ?{|
    +id: string,
  |},
|};
export type useQueryLoaderLiveQueryTestQueryResponse = useQueryLoaderLiveQueryTestQuery$data;
export type useQueryLoaderLiveQueryTestQuery = {|
  variables: useQueryLoaderLiveQueryTestQueryVariables,
  response: useQueryLoaderLiveQueryTestQuery$data,
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
    "name": "useQueryLoaderLiveQueryTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/)
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
    "name": "useQueryLoaderLiveQueryTestQuery",
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
    "cacheID": "ed71550bc8df05ff931522aecef1143a",
    "id": null,
    "metadata": {
      "live": {
        "polling_interval": 10000
      }
    },
    "name": "useQueryLoaderLiveQueryTestQuery",
    "operationKind": "query",
    "text": "query useQueryLoaderLiveQueryTestQuery(\n  $id: ID!\n) @live_query(polling_interval: 10000) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "db84fb335c4f305e0de63d1246959f74";
}

module.exports = ((node/*: any*/)/*: Query<
  useQueryLoaderLiveQueryTestQuery$variables,
  useQueryLoaderLiveQueryTestQuery$data,
>*/);
