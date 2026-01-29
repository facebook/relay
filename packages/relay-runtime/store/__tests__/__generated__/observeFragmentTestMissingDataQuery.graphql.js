/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3391d5651676f806425bfbea600e7e0a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestMissingDataFragment$fragmentType } from "./observeFragmentTestMissingDataFragment.graphql";
export type observeFragmentTestMissingDataQuery$variables = {||};
export type observeFragmentTestMissingDataQuery$data = {|
  +$fragmentSpreads: observeFragmentTestMissingDataFragment$fragmentType,
|};
export type observeFragmentTestMissingDataQuery = {|
  response: observeFragmentTestMissingDataQuery$data,
  variables: observeFragmentTestMissingDataQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeFragmentTestMissingDataQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "observeFragmentTestMissingDataFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "observeFragmentTestMissingDataQuery",
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
    "cacheID": "e4aa84ae7f1d89c5beba67812ab32b93",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestMissingDataQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestMissingDataQuery {\n  ...observeFragmentTestMissingDataFragment\n}\n\nfragment observeFragmentTestMissingDataFragment on Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "5022a2dca0608a261feab875e2f68e9d";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestMissingDataQuery$variables,
  observeFragmentTestMissingDataQuery$data,
>*/);
