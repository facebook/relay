/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<eb6b7526e3b99d85d763ed51246943a0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type observeFragmentTestMissingDataUnrelatedThrowOnFieldErrorQuery$variables = {||};
export type observeFragmentTestMissingDataUnrelatedThrowOnFieldErrorQuery$data = {|
  +me: ?{|
    +__typename: "User",
  |},
|};
export type observeFragmentTestMissingDataUnrelatedThrowOnFieldErrorQuery = {|
  response: observeFragmentTestMissingDataUnrelatedThrowOnFieldErrorQuery$data,
  variables: observeFragmentTestMissingDataUnrelatedThrowOnFieldErrorQuery$variables,
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
    "name": "observeFragmentTestMissingDataUnrelatedThrowOnFieldErrorQuery",
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
    "name": "observeFragmentTestMissingDataUnrelatedThrowOnFieldErrorQuery",
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
    "cacheID": "d888484e5da948f8173a88d8d29185d3",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestMissingDataUnrelatedThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestMissingDataUnrelatedThrowOnFieldErrorQuery {\n  me {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7169c204b4f0e65154906137f49639f9";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestMissingDataUnrelatedThrowOnFieldErrorQuery$variables,
  observeFragmentTestMissingDataUnrelatedThrowOnFieldErrorQuery$data,
>*/);
