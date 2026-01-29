/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a1281d3eb59ff6b7a67104598923dbde>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment$fragmentType } from "./waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment.graphql";
export type waitForFragmentDataTestThrowOnFieldErrorQuery$variables = {||};
export type waitForFragmentDataTestThrowOnFieldErrorQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment$fragmentType,
  |},
|};
export type waitForFragmentDataTestThrowOnFieldErrorQuery = {|
  response: waitForFragmentDataTestThrowOnFieldErrorQuery$data,
  variables: waitForFragmentDataTestThrowOnFieldErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "waitForFragmentDataTestThrowOnFieldErrorQuery",
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
            "name": "waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment"
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
    "name": "waitForFragmentDataTestThrowOnFieldErrorQuery",
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
            "name": "always_throws",
            "args": null,
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__typename",
                  "storageKey": null
                }
              ],
              "type": "User",
              "abstractKey": null
            },
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": true
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
    "cacheID": "ad3a882fbe0793d3884def36ad65e98d",
    "id": null,
    "metadata": {},
    "name": "waitForFragmentDataTestThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query waitForFragmentDataTestThrowOnFieldErrorQuery {\n  me {\n    ...waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment\n    id\n  }\n}\n\nfragment UserAlwaysThrowsResolver on User {\n  __typename\n}\n\nfragment waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment on User {\n  ...UserAlwaysThrowsResolver\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "84055cb59905eb4b8c0f2f01378632f9";
}

module.exports = ((node/*: any*/)/*: Query<
  waitForFragmentDataTestThrowOnFieldErrorQuery$variables,
  waitForFragmentDataTestThrowOnFieldErrorQuery$data,
>*/);
