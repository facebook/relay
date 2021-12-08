/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a8cdbc799c569570394eccd86f1c8dde>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayOperationTrackerTest2Query$variables = {|
  id?: ?string,
|};
export type RelayOperationTrackerTest2QueryVariables = RelayOperationTrackerTest2Query$variables;
export type RelayOperationTrackerTest2Query$data = {|
  +node: ?{|
    +__typename: string,
  |},
|};
export type RelayOperationTrackerTest2QueryResponse = RelayOperationTrackerTest2Query$data;
export type RelayOperationTrackerTest2Query = {|
  variables: RelayOperationTrackerTest2QueryVariables,
  response: RelayOperationTrackerTest2Query$data,
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
    "name": "RelayOperationTrackerTest2Query",
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
    "name": "RelayOperationTrackerTest2Query",
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
    "cacheID": "8db4bd9f833108ff0986698f5381f771",
    "id": null,
    "metadata": {},
    "name": "RelayOperationTrackerTest2Query",
    "operationKind": "query",
    "text": "query RelayOperationTrackerTest2Query(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b6a354be2e9f982e997ba603e11fb3c6";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayOperationTrackerTest2Query$variables,
  RelayOperationTrackerTest2Query$data,
>*/);
