/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<caef7c50e1e86396e2662d96d670f44c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest16Query$variables = {||};
export type RelayResponseNormalizerTest16QueryVariables = RelayResponseNormalizerTest16Query$variables;
export type RelayResponseNormalizerTest16Query$data = {|
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
export type RelayResponseNormalizerTest16QueryResponse = RelayResponseNormalizerTest16Query$data;
export type RelayResponseNormalizerTest16Query = {|
  variables: RelayResponseNormalizerTest16QueryVariables,
  response: RelayResponseNormalizerTest16Query$data,
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

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest16Query$variables,
  RelayResponseNormalizerTest16Query$data,
>*/);
