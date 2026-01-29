/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7eeeb30b9ea8d2f9d5c412bca490afc8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTest_user$fragmentType } from "./RelayReaderAliasedFragmentsTest_user.graphql";
export type RelayReaderAliasedFragmentsTestDeferredQuery$variables = {||};
export type RelayReaderAliasedFragmentsTestDeferredQuery$data = {|
  +me: ?{|
    +aliased_fragment: {|
      +$fragmentSpreads: RelayReaderAliasedFragmentsTest_user$fragmentType,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestDeferredQuery = {|
  response: RelayReaderAliasedFragmentsTestDeferredQuery$data,
  variables: RelayReaderAliasedFragmentsTestDeferredQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTestDeferredQuery",
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
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "kind": "Defer",
                  "selections": [
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "RelayReaderAliasedFragmentsTest_user"
                    }
                  ]
                }
              ],
              "type": "User",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "aliased_fragment"
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
    "name": "RelayReaderAliasedFragmentsTestDeferredQuery",
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
            "if": null,
            "kind": "Defer",
            "label": "RelayReaderAliasedFragmentsTestDeferredQuery$defer$RelayReaderAliasedFragmentsTest_user",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ]
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
    "cacheID": "85858fe2936b0d9a99cb2e7d7aa8789b",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestDeferredQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestDeferredQuery {\n  me {\n    ...RelayReaderAliasedFragmentsTest_user @defer(label: \"RelayReaderAliasedFragmentsTestDeferredQuery$defer$RelayReaderAliasedFragmentsTest_user\")\n    id\n  }\n}\n\nfragment RelayReaderAliasedFragmentsTest_user on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "6b14e05c332f3f98460c8085c5b18935";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestDeferredQuery$variables,
  RelayReaderAliasedFragmentsTestDeferredQuery$data,
>*/);
