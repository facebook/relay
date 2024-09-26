/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<18dc4d7638fe664b0822bfbd2a55fd23>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type waitForFragmentDataTestMissingDataUnrelatedThrowOnFieldErrorQuery$variables = {||};
export type waitForFragmentDataTestMissingDataUnrelatedThrowOnFieldErrorQuery$data = {|
  +me: ?{|
    +__typename: "User",
  |},
|};
export type waitForFragmentDataTestMissingDataUnrelatedThrowOnFieldErrorQuery = {|
  response: waitForFragmentDataTestMissingDataUnrelatedThrowOnFieldErrorQuery$data,
  variables: waitForFragmentDataTestMissingDataUnrelatedThrowOnFieldErrorQuery$variables,
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
    "name": "waitForFragmentDataTestMissingDataUnrelatedThrowOnFieldErrorQuery",
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
    "name": "waitForFragmentDataTestMissingDataUnrelatedThrowOnFieldErrorQuery",
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
    "cacheID": "698d5acc89abce4e8b83f8b1e4ec9149",
    "id": null,
    "metadata": {},
    "name": "waitForFragmentDataTestMissingDataUnrelatedThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query waitForFragmentDataTestMissingDataUnrelatedThrowOnFieldErrorQuery {\n  me {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1b5572e5cd3e5ffe678a72801228486b";
}

module.exports = ((node/*: any*/)/*: Query<
  waitForFragmentDataTestMissingDataUnrelatedThrowOnFieldErrorQuery$variables,
  waitForFragmentDataTestMissingDataUnrelatedThrowOnFieldErrorQuery$data,
>*/);
