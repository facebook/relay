/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f27f0860de83e97215b7c8c594fad303>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestThrowOnFieldErrorFragment$fragmentType } from "./observeFragmentTestThrowOnFieldErrorFragment.graphql";
export type observeFragmentTestThrowOnFieldErrorQuery$variables = {||};
export type observeFragmentTestThrowOnFieldErrorQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: observeFragmentTestThrowOnFieldErrorFragment$fragmentType,
  |},
|};
export type observeFragmentTestThrowOnFieldErrorQuery = {|
  response: observeFragmentTestThrowOnFieldErrorQuery$data,
  variables: observeFragmentTestThrowOnFieldErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeFragmentTestThrowOnFieldErrorQuery",
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
            "name": "observeFragmentTestThrowOnFieldErrorFragment"
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
    "name": "observeFragmentTestThrowOnFieldErrorQuery",
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
    "cacheID": "e727eed6fc5e886c089ef44994df7848",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestThrowOnFieldErrorQuery {\n  me {\n    ...observeFragmentTestThrowOnFieldErrorFragment\n    id\n  }\n}\n\nfragment observeFragmentTestThrowOnFieldErrorFragment on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "de4107f5e9d2a343acdb5ac2009abdee";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestThrowOnFieldErrorQuery$variables,
  observeFragmentTestThrowOnFieldErrorQuery$data,
>*/);
