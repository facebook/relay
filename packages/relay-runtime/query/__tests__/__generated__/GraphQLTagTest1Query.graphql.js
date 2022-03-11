/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<58bcabb8b8355f721232b53790308cb7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type GraphQLTagTest1Query$variables = {||};
export type GraphQLTagTest1Query$data = {|
  +me: ?{|
    +id: string,
  |},
|};
export type GraphQLTagTest1Query = {|
  response: GraphQLTagTest1Query$data,
  variables: GraphQLTagTest1Query$variables,
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

module.exports = ((node/*: any*/)/*: Query<
  GraphQLTagTest1Query$variables,
  GraphQLTagTest1Query$data,
>*/);
