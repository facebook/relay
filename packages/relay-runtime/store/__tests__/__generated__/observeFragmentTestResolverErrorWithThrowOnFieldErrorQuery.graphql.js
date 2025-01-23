/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d7bc5fae6e384a9f610c2361b12c3722>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment$fragmentType } from "./observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment.graphql";
export type observeFragmentTestResolverErrorWithThrowOnFieldErrorQuery$variables = {||};
export type observeFragmentTestResolverErrorWithThrowOnFieldErrorQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment$fragmentType,
  |},
|};
export type observeFragmentTestResolverErrorWithThrowOnFieldErrorQuery = {|
  response: observeFragmentTestResolverErrorWithThrowOnFieldErrorQuery$data,
  variables: observeFragmentTestResolverErrorWithThrowOnFieldErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeFragmentTestResolverErrorWithThrowOnFieldErrorQuery",
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
            "name": "observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment"
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
    "name": "observeFragmentTestResolverErrorWithThrowOnFieldErrorQuery",
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
    "cacheID": "2cd1d9f6151ff21dfd8d8fcb7af42644",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestResolverErrorWithThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestResolverErrorWithThrowOnFieldErrorQuery {\n  me {\n    ...observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment\n    id\n  }\n}\n\nfragment UserAlwaysThrowsResolver on User {\n  __typename\n}\n\nfragment observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment on User {\n  ...UserAlwaysThrowsResolver\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "1bea35a345360dc0314a1a5ddabb8acb";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestResolverErrorWithThrowOnFieldErrorQuery$variables,
  observeFragmentTestResolverErrorWithThrowOnFieldErrorQuery$data,
>*/);
