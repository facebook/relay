/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9717d6129a40df3904f051b6f25ab6ea>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTest_user$fragmentType } from "./RelayReaderAliasedFragmentsTest_user.graphql";
export type RelayReaderAliasedFragmentsTest2Query$variables = {||};
export type RelayReaderAliasedFragmentsTest2Query$data = {|
  +me: ?{|
    +aliased_fragment: {|
      +$fragmentSpreads: RelayReaderAliasedFragmentsTest_user$fragmentType,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTest2Query = {|
  response: RelayReaderAliasedFragmentsTest2Query$data,
  variables: RelayReaderAliasedFragmentsTest2Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTest2Query",
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
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "RelayReaderAliasedFragmentsTest_user"
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
    "name": "RelayReaderAliasedFragmentsTest2Query",
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
    "cacheID": "6da68a5ace1735b9dfd18ffc60f571d5",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTest2Query",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTest2Query {\n  me {\n    ...RelayReaderAliasedFragmentsTest_user\n    id\n  }\n}\n\nfragment RelayReaderAliasedFragmentsTest_user on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "b11ebdcd9ce6041e79c43ac0132394fd";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTest2Query$variables,
  RelayReaderAliasedFragmentsTest2Query$data,
>*/);
