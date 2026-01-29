/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8dffc4533d89b9f876ceee7657d2d467>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type observeQueryTestMissingDataUnrelatedThrowOnFieldErrorQuery$variables = {||};
export type observeQueryTestMissingDataUnrelatedThrowOnFieldErrorQuery$data = {|
  +me: ?{|
    +__typename: "User",
  |},
|};
export type observeQueryTestMissingDataUnrelatedThrowOnFieldErrorQuery = {|
  response: observeQueryTestMissingDataUnrelatedThrowOnFieldErrorQuery$data,
  variables: observeQueryTestMissingDataUnrelatedThrowOnFieldErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeQueryTestMissingDataUnrelatedThrowOnFieldErrorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/)
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
    "name": "observeQueryTestMissingDataUnrelatedThrowOnFieldErrorQuery",
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
    "cacheID": "675526f1d29570a05a0db2e4922ae976",
    "id": null,
    "metadata": {},
    "name": "observeQueryTestMissingDataUnrelatedThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query observeQueryTestMissingDataUnrelatedThrowOnFieldErrorQuery {\n  me {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f2f774d0e2e76182f3eb83256b8185ba";
}

module.exports = ((node/*: any*/)/*: Query<
  observeQueryTestMissingDataUnrelatedThrowOnFieldErrorQuery$variables,
  observeQueryTestMissingDataUnrelatedThrowOnFieldErrorQuery$data,
>*/);
