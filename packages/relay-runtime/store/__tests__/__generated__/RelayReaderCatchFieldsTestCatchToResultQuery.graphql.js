/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8111705544793bdcb2fe1de2987e7160>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderCatchFieldsTestCatchToResultFragment$fragmentType } from "./RelayReaderCatchFieldsTestCatchToResultFragment.graphql";
export type RelayReaderCatchFieldsTestCatchToResultQuery$variables = {||};
export type RelayReaderCatchFieldsTestCatchToResultQuery$data = {|
  +$fragmentSpreads: RelayReaderCatchFieldsTestCatchToResultFragment$fragmentType,
|};
export type RelayReaderCatchFieldsTestCatchToResultQuery = {|
  response: RelayReaderCatchFieldsTestCatchToResultQuery$data,
  variables: RelayReaderCatchFieldsTestCatchToResultQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderCatchFieldsTestCatchToResultQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "RelayReaderCatchFieldsTestCatchToResultFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderCatchFieldsTestCatchToResultQuery",
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
    "cacheID": "d301ed8934f721bf93f82cda0bd95585",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestCatchToResultQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestCatchToResultQuery {\n  ...RelayReaderCatchFieldsTestCatchToResultFragment\n}\n\nfragment RelayReaderCatchFieldsTestCatchToResultFragment on Query {\n  me {\n    firstName\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "e1dd60b678804c69e882a4f03bfe3bae";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTestCatchToResultQuery$variables,
  RelayReaderCatchFieldsTestCatchToResultQuery$data,
>*/);
