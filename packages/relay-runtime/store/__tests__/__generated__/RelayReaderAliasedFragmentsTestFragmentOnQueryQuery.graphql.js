/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<789813f887bd210740266157a0d252e7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTest_query$fragmentType } from "./RelayReaderAliasedFragmentsTest_query.graphql";
export type RelayReaderAliasedFragmentsTestFragmentOnQueryQuery$variables = {||};
export type RelayReaderAliasedFragmentsTestFragmentOnQueryQuery$data = {|
  +RelayReaderAliasedFragmentsTest_query: {|
    +$fragmentSpreads: RelayReaderAliasedFragmentsTest_query$fragmentType,
  |},
|};
export type RelayReaderAliasedFragmentsTestFragmentOnQueryQuery = {|
  response: RelayReaderAliasedFragmentsTestFragmentOnQueryQuery$data,
  variables: RelayReaderAliasedFragmentsTestFragmentOnQueryQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTestFragmentOnQueryQuery",
    "selections": [
      {
        "fragment": {
          "kind": "InlineFragment",
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "RelayReaderAliasedFragmentsTest_query"
            }
          ],
          "type": "Query",
          "abstractKey": null
        },
        "kind": "AliasedInlineFragmentSpread",
        "name": "RelayReaderAliasedFragmentsTest_query"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderAliasedFragmentsTestFragmentOnQueryQuery",
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
    "cacheID": "e838547f16e39f4c0f9f5584f14c94c5",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestFragmentOnQueryQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestFragmentOnQueryQuery {\n  ...RelayReaderAliasedFragmentsTest_query\n}\n\nfragment RelayReaderAliasedFragmentsTest_query on Query {\n  me {\n    name\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*:: as any*/).hash = "757ba368305e4eeb98c2686cf25aa388";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderAliasedFragmentsTestFragmentOnQueryQuery$variables,
  RelayReaderAliasedFragmentsTestFragmentOnQueryQuery$data,
>*/);
