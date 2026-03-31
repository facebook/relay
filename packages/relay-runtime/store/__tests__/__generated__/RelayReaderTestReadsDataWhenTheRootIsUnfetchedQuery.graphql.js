/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<11165904217b3216b6a27a93825f2b61>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$fragmentType } from "./RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile.graphql";
export type RelayReaderTestReadsDataWhenTheRootIsUnfetchedQuery$variables = {||};
export type RelayReaderTestReadsDataWhenTheRootIsUnfetchedQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile$fragmentType,
  |},
|};
export type RelayReaderTestReadsDataWhenTheRootIsUnfetchedQuery = {|
  response: RelayReaderTestReadsDataWhenTheRootIsUnfetchedQuery$data,
  variables: RelayReaderTestReadsDataWhenTheRootIsUnfetchedQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestReadsDataWhenTheRootIsUnfetchedQuery",
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
    "name": "RelayReaderTestReadsDataWhenTheRootIsUnfetchedQuery",
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
    "cacheID": "9d229954bac2239a7c6431b982b2cca2",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestReadsDataWhenTheRootIsUnfetchedQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestReadsDataWhenTheRootIsUnfetchedQuery {\n  me {\n    ...RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile\n    id\n  }\n}\n\nfragment RelayReaderTestReadsDataWhenTheRootIsDeletedUserProfile on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*:: as any*/).hash = "265eedaf609b353b309c79fdabfdb31e";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderTestReadsDataWhenTheRootIsUnfetchedQuery$variables,
  RelayReaderTestReadsDataWhenTheRootIsUnfetchedQuery$data,
>*/);
