/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f255d09f4048b1e0cf6c285a392c47ef>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type observeQueryTestMissingRequiredQuery$variables = {||};
export type observeQueryTestMissingRequiredQuery$data = {|
  +me: ?{|
    +name: string,
  |},
|};
export type observeQueryTestMissingRequiredQuery = {|
  response: observeQueryTestMissingRequiredQuery$data,
  variables: observeQueryTestMissingRequiredQuery$variables,
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
    "metadata": null,
    "name": "observeQueryTestMissingRequiredQuery",
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
            "kind": "RequiredField",
            "field": (v0/*: any*/),
            "action": "THROW"
          }
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
    "name": "observeQueryTestMissingRequiredQuery",
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
    "cacheID": "707724bd3beaff7ad90917bad010d845",
    "id": null,
    "metadata": {},
    "name": "observeQueryTestMissingRequiredQuery",
    "operationKind": "query",
    "text": "query observeQueryTestMissingRequiredQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b548b7931d8b55a04a57e7b1c1797f4c";
}

module.exports = ((node/*: any*/)/*: Query<
  observeQueryTestMissingRequiredQuery$variables,
  observeQueryTestMissingRequiredQuery$data,
>*/);
