/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<66b1c2e7e64d21366d6768bbf1b6b833>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type emptyQueriesAvoidSuspenseTestPreloadedQuery$variables = {|
  skip: boolean,
|};
export type emptyQueriesAvoidSuspenseTestPreloadedQuery$data = {|
  +me?: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type emptyQueriesAvoidSuspenseTestPreloadedQuery = {|
  response: emptyQueriesAvoidSuspenseTestPreloadedQuery$data,
  variables: emptyQueriesAvoidSuspenseTestPreloadedQuery$variables,
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
    "name": "emptyQueriesAvoidSuspenseTestPreloadedQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "emptyQueriesAvoidSuspenseTestPreloadedQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "fbc2331c5c25450afbdebbd65d490448",
    "id": null,
    "metadata": {},
    "name": "emptyQueriesAvoidSuspenseTestPreloadedQuery",
    "operationKind": "query",
    "text": "query emptyQueriesAvoidSuspenseTestPreloadedQuery(\n  $skip: Boolean!\n) {\n  me @skip(if: $skip) {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e036c43354d94f752618fda2a5d85981";
}

module.exports = ((node/*: any*/)/*: Query<
  emptyQueriesAvoidSuspenseTestPreloadedQuery$variables,
  emptyQueriesAvoidSuspenseTestPreloadedQuery$data,
>*/);
