/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0525ee8d3324c8c215f322cf3057ab44>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderTestReadScalarProfile$fragmentType = any;
export type RelayReaderTestReadScalarUserQuery$variables = {||};
export type RelayReaderTestReadScalarUserQueryVariables = RelayReaderTestReadScalarUserQuery$variables;
export type RelayReaderTestReadScalarUserQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestReadScalarProfile$fragmentType,
  |},
|};
export type RelayReaderTestReadScalarUserQueryResponse = RelayReaderTestReadScalarUserQuery$data;
export type RelayReaderTestReadScalarUserQuery = {|
  variables: RelayReaderTestReadScalarUserQueryVariables,
  response: RelayReaderTestReadScalarUserQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestReadScalarUserQuery",
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
            "name": "RelayReaderTestReadScalarProfile"
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
    "name": "RelayReaderTestReadScalarUserQuery",
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "36167e5f405375f1767721e049b5e0b3",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestReadScalarUserQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestReadScalarUserQuery {\n  me {\n    ...RelayReaderTestReadScalarProfile\n    id\n  }\n}\n\nfragment RelayReaderTestReadScalarProfile on User {\n  id\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "e60a1a946af376c16ef0358a6effba9d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestReadScalarUserQuery$variables,
  RelayReaderTestReadScalarUserQuery$data,
>*/);
