/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ff300d677460c4cb539e80577284edc6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type GraphQLTagTest1QueryVariables = {||};
export type GraphQLTagTest1QueryResponse = {|
  +me: ?{|
    +id: string,
  |},
|};
export type GraphQLTagTest1Query = {|
  variables: GraphQLTagTest1QueryVariables,
  response: GraphQLTagTest1QueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "me",
    "plural": false,
    "selections": [
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
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "GraphQLTagTest1Query",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "GraphQLTagTest1Query",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "a6921ec95f506d036e38300a1125755e",
    "id": null,
    "metadata": {},
    "name": "GraphQLTagTest1Query",
    "operationKind": "query",
    "text": "query GraphQLTagTest1Query {\n  me {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3aba6197bd5a1f5de4eccaa2ec627ae3";
}

module.exports = node;
