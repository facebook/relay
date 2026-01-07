/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ffccac78d38a2ef88240f3c6361f9eef>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type useLazyLoadQueryNodeEmptyQueryTestPreloadedQuery$variables = {|
  skip: boolean,
|};
export type useLazyLoadQueryNodeEmptyQueryTestPreloadedQuery$data = {|
  +me?: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type useLazyLoadQueryNodeEmptyQueryTestPreloadedQuery = {|
  response: useLazyLoadQueryNodeEmptyQueryTestPreloadedQuery$data,
  variables: useLazyLoadQueryNodeEmptyQueryTestPreloadedQuery$variables,
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
    "name": "useLazyLoadQueryNodeEmptyQueryTestPreloadedQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useLazyLoadQueryNodeEmptyQueryTestPreloadedQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "62b5fedb6c4a3228ce7eb5712cad0aa0",
    "id": null,
    "metadata": {},
    "name": "useLazyLoadQueryNodeEmptyQueryTestPreloadedQuery",
    "operationKind": "query",
    "text": "query useLazyLoadQueryNodeEmptyQueryTestPreloadedQuery(\n  $skip: Boolean!\n) {\n  me @skip(if: $skip) {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "67d07152285442ccebdeb3694d0c1510";
}

module.exports = ((node/*: any*/)/*: Query<
  useLazyLoadQueryNodeEmptyQueryTestPreloadedQuery$variables,
  useLazyLoadQueryNodeEmptyQueryTestPreloadedQuery$data,
>*/);
