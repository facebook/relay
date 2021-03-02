/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<759374a7a42391a35499190da0ceb888>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayReaderRequiredFieldsTest3Fragment$ref = any;
export type RelayReaderRequiredFieldsTest21QueryVariables = {||};
export type RelayReaderRequiredFieldsTest21QueryResponse = {|
  +$fragmentRefs: RelayReaderRequiredFieldsTest3Fragment$ref,
|};
export type RelayReaderRequiredFieldsTest21Query = {|
  variables: RelayReaderRequiredFieldsTest21QueryVariables,
  response: RelayReaderRequiredFieldsTest21QueryResponse,
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

module.exports = node;
