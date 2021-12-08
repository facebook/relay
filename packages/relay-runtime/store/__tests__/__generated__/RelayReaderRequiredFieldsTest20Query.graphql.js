/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5119ad9a6e763e8b75d847bc85f26cd6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderRequiredFieldsTest2Fragment$fragmentType = any;
export type RelayReaderRequiredFieldsTest20Query$variables = {||};
export type RelayReaderRequiredFieldsTest20QueryVariables = RelayReaderRequiredFieldsTest20Query$variables;
export type RelayReaderRequiredFieldsTest20Query$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderRequiredFieldsTest2Fragment$fragmentType,
  |},
|};
export type RelayReaderRequiredFieldsTest20QueryResponse = RelayReaderRequiredFieldsTest20Query$data;
export type RelayReaderRequiredFieldsTest20Query = {|
  variables: RelayReaderRequiredFieldsTest20QueryVariables,
  response: RelayReaderRequiredFieldsTest20Query$data,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest20Query",
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
            "name": "RelayReaderRequiredFieldsTest2Fragment"
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
    "name": "RelayReaderRequiredFieldsTest20Query",
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
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "backgroundImage",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "uri",
                "storageKey": null
              }
            ],
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
    "cacheID": "98826e6c7827c45c09dbf2455dd4b1bc",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest20Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest20Query {\n  me {\n    ...RelayReaderRequiredFieldsTest2Fragment\n    id\n  }\n}\n\nfragment RelayReaderRequiredFieldsTest2Fragment on User {\n  backgroundImage {\n    uri\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "b25cc3fddd27a175aefdaa8b729aaebb";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest20Query$variables,
  RelayReaderRequiredFieldsTest20Query$data,
>*/);
