/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a194c68f417d0275e0e67ac709ad9829>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayReaderTestReadScalarProfile$ref = any;
export type RelayReaderTestReadScalarUserQueryVariables = {||};
export type RelayReaderTestReadScalarUserQueryResponse = {|
  +me: ?{|
    +$fragmentRefs: RelayReaderTestReadScalarProfile$ref,
  |},
|};
export type RelayReaderTestReadScalarUserQuery = {|
  variables: RelayReaderTestReadScalarUserQueryVariables,
  response: RelayReaderTestReadScalarUserQueryResponse,
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

module.exports = node;
