/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7a2bd3b30ee499e9c7948d93f7f6701f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type emptyQueriesAvoidSuspenseTestSkipQuery$variables = {|
  skip: boolean,
|};
export type emptyQueriesAvoidSuspenseTestSkipQuery$data = {|
  +me?: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type emptyQueriesAvoidSuspenseTestSkipQuery = {|
  response: emptyQueriesAvoidSuspenseTestSkipQuery$data,
  variables: emptyQueriesAvoidSuspenseTestSkipQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skip"
  }
],
v1 = [
  {
    "condition": "skip",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "emptyQueriesAvoidSuspenseTestSkipQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "emptyQueriesAvoidSuspenseTestSkipQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3bafdbdbdab69645e9fdaaab68735e26",
    "id": null,
    "metadata": {},
    "name": "emptyQueriesAvoidSuspenseTestSkipQuery",
    "operationKind": "query",
    "text": "query emptyQueriesAvoidSuspenseTestSkipQuery(\n  $skip: Boolean!\n) {\n  me @skip(if: $skip) {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c81f941e2cf23a86230e32f2f8e616d2";
}

module.exports = ((node/*: any*/)/*: Query<
  emptyQueriesAvoidSuspenseTestSkipQuery$variables,
  emptyQueriesAvoidSuspenseTestSkipQuery$data,
>*/);
