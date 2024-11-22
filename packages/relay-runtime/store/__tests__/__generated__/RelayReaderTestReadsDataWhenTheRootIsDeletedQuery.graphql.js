/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7296a2c662bf096241eebbdce7cacd99>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$fragmentType } from "./RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile.graphql";
export type RelayReaderTestReadsDataWhenTheRootIsDeletedQuery$variables = {||};
export type RelayReaderTestReadsDataWhenTheRootIsDeletedQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$fragmentType,
  |},
|};
export type RelayReaderTestReadsDataWhenTheRootIsDeletedQuery = {|
  response: RelayReaderTestReadsDataWhenTheRootIsDeletedQuery$data,
  variables: RelayReaderTestReadsDataWhenTheRootIsDeletedQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestReadsDataWhenTheRootIsDeletedQuery",
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
            "name": "RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile"
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
    "name": "RelayReaderTestReadsDataWhenTheRootIsDeletedQuery",
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
    "cacheID": "28e9200d803cd7e2a2417ae029aee158",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestReadsDataWhenTheRootIsDeletedQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestReadsDataWhenTheRootIsDeletedQuery {\n  me {\n    ...RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile\n    id\n  }\n}\n\nfragment RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "c326728366347fe02ba0c190fd22a454";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestReadsDataWhenTheRootIsDeletedQuery$variables,
  RelayReaderTestReadsDataWhenTheRootIsDeletedQuery$data,
>*/);
