/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a6072638a7e0166bd6ad164cdf13af1b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderCatchFieldsTestCatchToNullFragment$fragmentType } from "./RelayReaderCatchFieldsTestCatchToNullFragment.graphql";
export type RelayReaderCatchFieldsTestCatchToNullQuery$variables = {||};
export type RelayReaderCatchFieldsTestCatchToNullQuery$data = {|
  +$fragmentSpreads: RelayReaderCatchFieldsTestCatchToNullFragment$fragmentType,
|};
export type RelayReaderCatchFieldsTestCatchToNullQuery = {|
  response: RelayReaderCatchFieldsTestCatchToNullQuery$data,
  variables: RelayReaderCatchFieldsTestCatchToNullQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderCatchFieldsTestCatchToNullQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "RelayReaderCatchFieldsTestCatchToNullFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderCatchFieldsTestCatchToNullQuery",
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
            "name": "firstName",
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
    "cacheID": "6c18bdffcca36b5db4c1578e7fc211eb",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestCatchToNullQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestCatchToNullQuery {\n  ...RelayReaderCatchFieldsTestCatchToNullFragment\n}\n\nfragment RelayReaderCatchFieldsTestCatchToNullFragment on Query {\n  me {\n    firstName\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "fbcce6d40ab0d3ecbbbb0d5948a59549";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTestCatchToNullQuery$variables,
  RelayReaderCatchFieldsTestCatchToNullQuery$data,
>*/);
