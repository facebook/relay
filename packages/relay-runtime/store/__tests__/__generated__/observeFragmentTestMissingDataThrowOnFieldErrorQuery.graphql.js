/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<97a11017454440c74156bebf1a21d57c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestMissingDataThrowOnFieldErrorFragment$fragmentType } from "./observeFragmentTestMissingDataThrowOnFieldErrorFragment.graphql";
export type observeFragmentTestMissingDataThrowOnFieldErrorQuery$variables = {||};
export type observeFragmentTestMissingDataThrowOnFieldErrorQuery$data = {|
  +$fragmentSpreads: observeFragmentTestMissingDataThrowOnFieldErrorFragment$fragmentType,
|};
export type observeFragmentTestMissingDataThrowOnFieldErrorQuery = {|
  response: observeFragmentTestMissingDataThrowOnFieldErrorQuery$data,
  variables: observeFragmentTestMissingDataThrowOnFieldErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeFragmentTestMissingDataThrowOnFieldErrorQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "observeFragmentTestMissingDataThrowOnFieldErrorFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "observeFragmentTestMissingDataThrowOnFieldErrorQuery",
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
    "cacheID": "2c49e57c37d50ba0c97f40978d2d93da",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestMissingDataThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestMissingDataThrowOnFieldErrorQuery {\n  ...observeFragmentTestMissingDataThrowOnFieldErrorFragment\n}\n\nfragment observeFragmentTestMissingDataThrowOnFieldErrorFragment on Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "1692df3848514e5ca545277f62c1d434";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestMissingDataThrowOnFieldErrorQuery$variables,
  observeFragmentTestMissingDataThrowOnFieldErrorQuery$data,
>*/);
