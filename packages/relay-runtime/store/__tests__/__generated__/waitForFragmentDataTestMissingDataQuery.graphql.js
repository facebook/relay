/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2eb1d65450304da48aa8fa0856656fcb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { waitForFragmentDataTestMissingDataFragment$fragmentType } from "./waitForFragmentDataTestMissingDataFragment.graphql";
export type waitForFragmentDataTestMissingDataQuery$variables = {||};
export type waitForFragmentDataTestMissingDataQuery$data = {|
  +$fragmentSpreads: waitForFragmentDataTestMissingDataFragment$fragmentType,
|};
export type waitForFragmentDataTestMissingDataQuery = {|
  response: waitForFragmentDataTestMissingDataQuery$data,
  variables: waitForFragmentDataTestMissingDataQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "waitForFragmentDataTestMissingDataQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "waitForFragmentDataTestMissingDataFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "waitForFragmentDataTestMissingDataQuery",
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
    "cacheID": "13402c908576d5c8f5cb0f6704a6295c",
    "id": null,
    "metadata": {},
    "name": "waitForFragmentDataTestMissingDataQuery",
    "operationKind": "query",
    "text": "query waitForFragmentDataTestMissingDataQuery {\n  ...waitForFragmentDataTestMissingDataFragment\n}\n\nfragment waitForFragmentDataTestMissingDataFragment on Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "17cb14e509fb8b5cdf3500f4ca163376";
}

module.exports = ((node/*: any*/)/*: Query<
  waitForFragmentDataTestMissingDataQuery$variables,
  waitForFragmentDataTestMissingDataQuery$data,
>*/);
