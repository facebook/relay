/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4f49edc6b8b70bea52e470ea3bf72b8f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type observeQueryTestMissingDataUnrelatedQuery$variables = {||};
export type observeQueryTestMissingDataUnrelatedQuery$data = {|
  +me: ?{|
    +__typename: "User",
  |},
|};
export type observeQueryTestMissingDataUnrelatedQuery = {|
  response: observeQueryTestMissingDataUnrelatedQuery$data,
  variables: observeQueryTestMissingDataUnrelatedQuery$variables,
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
    "name": "observeQueryTestMissingDataUnrelatedQuery",
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
    "name": "observeQueryTestMissingDataUnrelatedQuery",
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
    "cacheID": "68872f518ba2e0b2eaa2d19f91b90428",
    "id": null,
    "metadata": {},
    "name": "observeQueryTestMissingDataUnrelatedQuery",
    "operationKind": "query",
    "text": "query observeQueryTestMissingDataUnrelatedQuery {\n  me {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7ea7dad2b70a3cbeb40022b3f5970f4f";
}

module.exports = ((node/*: any*/)/*: Query<
  observeQueryTestMissingDataUnrelatedQuery$variables,
  observeQueryTestMissingDataUnrelatedQuery$data,
>*/);
