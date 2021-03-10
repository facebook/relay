/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<66e2f34b56c693fd084d26b0ed1e4380>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type RelayModernEnvironmentExecuteWithOptimisticResponseTestActor2QueryVariables = {||};
export type RelayModernEnvironmentExecuteWithOptimisticResponseTestActor2QueryResponse = {|
  +me: ?{|
    +name: ?string,
    +lastName: ?string,
  |},
|};
export type RelayModernEnvironmentExecuteWithOptimisticResponseTestActor2Query = {|
  variables: RelayModernEnvironmentExecuteWithOptimisticResponseTestActor2QueryVariables,
  response: RelayModernEnvironmentExecuteWithOptimisticResponseTestActor2QueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastName",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithOptimisticResponseTestActor2Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteWithOptimisticResponseTestActor2Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
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
    "cacheID": "6cf84ea246f30857cc03ec95de4dc01b",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithOptimisticResponseTestActor2Query",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithOptimisticResponseTestActor2Query {\n  me {\n    name\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "02fe375518097833333acc788cea5d5c";
}

module.exports = node;
