/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0cafa1ed051f30883509d2ac303d14ce>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderFragmentQueryTestFragment$fragmentType = any;
export type RelayReaderFragmentQueryTestReadsQueryDataFromAFragmentQuery$variables = {||};
export type RelayReaderFragmentQueryTestReadsQueryDataFromAFragmentQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderFragmentQueryTestFragment$fragmentType,
  |},
|};
export type RelayReaderFragmentQueryTestReadsQueryDataFromAFragmentQuery = {|
  response: RelayReaderFragmentQueryTestReadsQueryDataFromAFragmentQuery$data,
  variables: RelayReaderFragmentQueryTestReadsQueryDataFromAFragmentQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderFragmentQueryTestReadsQueryDataFromAFragmentQuery",
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
            "name": "RelayReaderFragmentQueryTestFragment"
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
    "name": "RelayReaderFragmentQueryTestReadsQueryDataFromAFragmentQuery",
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
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "firstName",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "8de692e11a11fcac82e045b5f78ee2ca",
    "id": null,
    "metadata": {},
    "name": "RelayReaderFragmentQueryTestReadsQueryDataFromAFragmentQuery",
    "operationKind": "query",
    "text": "query RelayReaderFragmentQueryTestReadsQueryDataFromAFragmentQuery {\n  me {\n    id\n    firstName\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "562fa9640e8c9e1f22243c323ec336ed";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderFragmentQueryTestReadsQueryDataFromAFragmentQuery$variables,
  RelayReaderFragmentQueryTestReadsQueryDataFromAFragmentQuery$data,
>*/);
