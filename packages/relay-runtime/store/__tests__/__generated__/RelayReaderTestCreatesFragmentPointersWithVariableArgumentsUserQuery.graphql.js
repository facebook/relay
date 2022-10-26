/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6b58a3b6c6f99f19abc948c17794f533>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$fragmentType } from "./RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile.graphql";
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserQuery$variables = {||};
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile$fragmentType,
  |},
|};
export type RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserQuery = {|
  response: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserQuery$data,
  variables: RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserQuery",
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
            "name": "RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile"
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
    "name": "RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserQuery",
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
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "profilePicture",
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "67244ccc67f3b73bf01392a31b0627a6",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserQuery {\n  me {\n    ...RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile\n    id\n  }\n}\n\nfragment RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfile on User {\n  id\n  ...RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture_273SL1\n}\n\nfragment RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserProfilePicture_273SL1 on User {\n  profilePicture {\n    uri\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "7a9eaa1476798159533ae048a3ff048a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserQuery$variables,
  RelayReaderTestCreatesFragmentPointersWithVariableArgumentsUserQuery$data,
>*/);
