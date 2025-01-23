/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<62f592e6a62ed2b8aeeae83c85af2378>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestMissingRequiredFragment$fragmentType } from "./observeFragmentTestMissingRequiredFragment.graphql";
export type observeFragmentTestMissingRequiredQuery$variables = {||};
export type observeFragmentTestMissingRequiredQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: observeFragmentTestMissingRequiredFragment$fragmentType,
  |},
|};
export type observeFragmentTestMissingRequiredQuery = {|
  response: observeFragmentTestMissingRequiredQuery$data,
  variables: observeFragmentTestMissingRequiredQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeFragmentTestMissingRequiredQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "observeFragmentTestMissingRequiredFragment"
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
    "name": "observeFragmentTestMissingRequiredQuery",
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
            "name": "name",
            "storageKey": null
          },
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
    "cacheID": "ac922a7f806fc2193bfcf1d440a9e28d",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestMissingRequiredQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestMissingRequiredQuery {\n  me {\n    ...observeFragmentTestMissingRequiredFragment\n    id\n  }\n}\n\nfragment observeFragmentTestMissingRequiredFragment on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "7a946e6ad5139d7b15ccd06ff3be312f";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestMissingRequiredQuery$variables,
  observeFragmentTestMissingRequiredQuery$data,
>*/);
