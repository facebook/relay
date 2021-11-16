/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a6755fa88b48e70a15638f93e9bb6d19>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernStoreTest8Query$variables = {|
  id: string,
|};
export type RelayModernStoreTest8QueryVariables = RelayModernStoreTest8Query$variables;
export type RelayModernStoreTest8Query$data = {|
  +node: ?{|
    +__typename: string,
  |},
|};
export type RelayModernStoreTest8QueryResponse = RelayModernStoreTest8Query$data;
export type RelayModernStoreTest8Query = {|
  variables: RelayModernStoreTest8QueryVariables,
  response: RelayModernStoreTest8Query$data,
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
    "name": "RelayModernStoreTest8Query",
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
    "name": "RelayModernStoreTest8Query",
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
    "cacheID": "cb2b460c3c1340ab2744de7f81cef4d7",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreTest8Query",
    "operationKind": "query",
    "text": "query RelayModernStoreTest8Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "93de95be7a562f1ddc9b16593641a08d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernStoreTest8Query$variables,
  RelayModernStoreTest8Query$data,
>*/);
