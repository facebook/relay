/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<64c3a3029ebce3ce7e8188f90f9391c5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderRequiredFieldsTest1Fragment$fragmentType } from "./RelayReaderRequiredFieldsTest1Fragment.graphql";
export type RelayReaderRequiredFieldsTest19Query$variables = {||};
export type RelayReaderRequiredFieldsTest19Query$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderRequiredFieldsTest1Fragment$fragmentType,
  |},
|};
export type RelayReaderRequiredFieldsTest19Query = {|
  response: RelayReaderRequiredFieldsTest19Query$data,
  variables: RelayReaderRequiredFieldsTest19Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest19Query",
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
            "name": "RelayReaderRequiredFieldsTest1Fragment"
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
    "name": "RelayReaderRequiredFieldsTest19Query",
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
    "cacheID": "f8e128c942d21020bcbfeb3775ca4269",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest19Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest19Query {\n  me {\n    ...RelayReaderRequiredFieldsTest1Fragment\n    id\n  }\n}\n\nfragment RelayReaderRequiredFieldsTest1Fragment on User {\n  lastName\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "7e68f5f83efff96a75681de09d90c44c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest19Query$variables,
  RelayReaderRequiredFieldsTest19Query$data,
>*/);
