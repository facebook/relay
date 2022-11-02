/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<78c9726f9fe97cf9103d90677fb956f8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderRequiredFieldsTest3Fragment$fragmentType } from "./RelayReaderRequiredFieldsTest3Fragment.graphql";
export type RelayReaderRequiredFieldsTest21Query$variables = {||};
export type RelayReaderRequiredFieldsTest21Query$data = {|
  +$fragmentSpreads: RelayReaderRequiredFieldsTest3Fragment$fragmentType,
|};
export type RelayReaderRequiredFieldsTest21Query = {|
  response: RelayReaderRequiredFieldsTest21Query$data,
  variables: RelayReaderRequiredFieldsTest21Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest21Query",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "RelayReaderRequiredFieldsTest3Fragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRequiredFieldsTest21Query",
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
            "name": "lastName",
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
    "cacheID": "f0d9c6726d4d0877e71c37e4970391e1",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest21Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest21Query {\n  ...RelayReaderRequiredFieldsTest3Fragment\n}\n\nfragment RelayReaderRequiredFieldsTest3Fragment on Query {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "f8c1003f5248d8d2562da4d81e31c374";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest21Query$variables,
  RelayReaderRequiredFieldsTest21Query$data,
>*/);
