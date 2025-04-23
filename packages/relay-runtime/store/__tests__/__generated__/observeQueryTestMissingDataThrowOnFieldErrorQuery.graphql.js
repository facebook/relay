/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<63b805928cad74aec1262eb1dfaf9298>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type observeQueryTestMissingDataThrowOnFieldErrorQuery$variables = {||};
export type observeQueryTestMissingDataThrowOnFieldErrorQuery$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type observeQueryTestMissingDataThrowOnFieldErrorQuery = {|
  response: observeQueryTestMissingDataThrowOnFieldErrorQuery$data,
  variables: observeQueryTestMissingDataThrowOnFieldErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "throwOnFieldError": true
    },
    "name": "observeQueryTestMissingDataThrowOnFieldErrorQuery",
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
    "name": "observeQueryTestMissingDataThrowOnFieldErrorQuery",
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
    "cacheID": "822ec917528a39a1cb8331c99debf942",
    "id": null,
    "metadata": {},
    "name": "observeQueryTestMissingDataThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query observeQueryTestMissingDataThrowOnFieldErrorQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2c67ee13885f703685a003f37f84b58e";
}

module.exports = ((node/*: any*/)/*: Query<
  observeQueryTestMissingDataThrowOnFieldErrorQuery$variables,
  observeQueryTestMissingDataThrowOnFieldErrorQuery$data,
>*/);
