/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<33554d17ab26aa8dd5d930becd3649ff>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { waitForFragmentDataTestOkFragment$fragmentType } from "./waitForFragmentDataTestOkFragment.graphql";
export type waitForFragmentDataTestOkQuery$variables = {||};
export type waitForFragmentDataTestOkQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: waitForFragmentDataTestOkFragment$fragmentType,
  |},
|};
export type waitForFragmentDataTestOkQuery = {|
  response: waitForFragmentDataTestOkQuery$data,
  variables: waitForFragmentDataTestOkQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "waitForFragmentDataTestOkQuery",
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
            "name": "waitForFragmentDataTestOkFragment"
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
    "name": "waitForFragmentDataTestOkQuery",
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
    "cacheID": "bd8a60d7e9780d13bd6be8e4684ac1be",
    "id": null,
    "metadata": {},
    "name": "waitForFragmentDataTestOkQuery",
    "operationKind": "query",
    "text": "query waitForFragmentDataTestOkQuery {\n  me {\n    ...waitForFragmentDataTestOkFragment\n    id\n  }\n}\n\nfragment waitForFragmentDataTestOkFragment on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "99c49338156a95ae3f782022263313e7";
}

module.exports = ((node/*: any*/)/*: Query<
  waitForFragmentDataTestOkQuery$variables,
  waitForFragmentDataTestOkQuery$data,
>*/);
