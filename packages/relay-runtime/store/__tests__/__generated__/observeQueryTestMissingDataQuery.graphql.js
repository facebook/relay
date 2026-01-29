/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<33f91a63eb0724562bcf16677a24057a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type observeQueryTestMissingDataQuery$variables = {||};
export type observeQueryTestMissingDataQuery$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type observeQueryTestMissingDataQuery = {|
  response: observeQueryTestMissingDataQuery$data,
  variables: observeQueryTestMissingDataQuery$variables,
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
    "name": "observeQueryTestMissingDataQuery",
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
    "name": "observeQueryTestMissingDataQuery",
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
    "cacheID": "42404fb6150a1449eab3884b37c73364",
    "id": null,
    "metadata": {},
    "name": "observeQueryTestMissingDataQuery",
    "operationKind": "query",
    "text": "query observeQueryTestMissingDataQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fce2f88e91a34d55e4623cc1fe05fd8d";
}

module.exports = ((node/*: any*/)/*: Query<
  observeQueryTestMissingDataQuery$variables,
  observeQueryTestMissingDataQuery$data,
>*/);
