/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f481b665ff4987849ead26ad6157eddf>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderRequiredFieldsTest1Fragment$fragmentType = any;
export type RelayReaderRequiredFieldsTest19Query$variables = {||};
export type RelayReaderRequiredFieldsTest19QueryVariables = RelayReaderRequiredFieldsTest19Query$variables;
export type RelayReaderRequiredFieldsTest19Query$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderRequiredFieldsTest1Fragment$fragmentType,
  |},
|};
export type RelayReaderRequiredFieldsTest19QueryResponse = RelayReaderRequiredFieldsTest19Query$data;
export type RelayReaderRequiredFieldsTest19Query = {|
  variables: RelayReaderRequiredFieldsTest19QueryVariables,
  response: RelayReaderRequiredFieldsTest19Query$data,
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
