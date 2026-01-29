/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ab8d3ad3deb9e238952fcb54f3bc9d4e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$fragmentType } from "./waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment.graphql";
export type waitForFragmentDataTestMissingDataThrowOnFieldErrorQuery$variables = {||};
export type waitForFragmentDataTestMissingDataThrowOnFieldErrorQuery$data = {|
  +$fragmentSpreads: waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment$fragmentType,
|};
export type waitForFragmentDataTestMissingDataThrowOnFieldErrorQuery = {|
  response: waitForFragmentDataTestMissingDataThrowOnFieldErrorQuery$data,
  variables: waitForFragmentDataTestMissingDataThrowOnFieldErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "waitForFragmentDataTestMissingDataThrowOnFieldErrorQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "waitForFragmentDataTestMissingDataThrowOnFieldErrorQuery",
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
    "cacheID": "cf5e156f85a5ab2455d2b3a66086889c",
    "id": null,
    "metadata": {},
    "name": "waitForFragmentDataTestMissingDataThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query waitForFragmentDataTestMissingDataThrowOnFieldErrorQuery {\n  ...waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment\n}\n\nfragment waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment on Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "03987518a418d771fb8e0701b50a8275";
}

module.exports = ((node/*: any*/)/*: Query<
  waitForFragmentDataTestMissingDataThrowOnFieldErrorQuery$variables,
  waitForFragmentDataTestMissingDataThrowOnFieldErrorQuery$data,
>*/);
