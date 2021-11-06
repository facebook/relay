/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<27312be8d85994e6635aca63d9a67b51>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type RelayResponseNormalizerTest16QueryVariables = {||};
export type RelayResponseNormalizerTest16QueryResponse = {|
  +me: ?{|
    +author: ?{|
      +id: string,
      +name: ?string,
    |},
  |},
  +meAgain: ?{|
    +author: ?{|
      +id: string,
      +name: ?string,
    |},
  |},
|};
export type RelayResponseNormalizerTest16Query = {|
  variables: RelayResponseNormalizerTest16QueryVariables,
  response: RelayResponseNormalizerTest16QueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "author",
  "plural": false,
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v2 = [
  (v1/*: any*/)
],
v3 = [
  (v1/*: any*/),
  (v0/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest16Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": (v2/*: any*/),
        "storageKey": null
      },
      {
        "alias": "meAgain",
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": (v2/*: any*/),
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
    "name": "RelayResponseNormalizerTest16Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": null
      },
      {
        "alias": "meAgain",
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "46ceb0a88e6c4c7d41c8a8ae46698ff7",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest16Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest16Query {\n  me {\n    author {\n      id\n      name\n    }\n    id\n  }\n  meAgain: me {\n    author {\n      id\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f1001c077d96e90b10fc29e250690d5c";
}

module.exports = node;
