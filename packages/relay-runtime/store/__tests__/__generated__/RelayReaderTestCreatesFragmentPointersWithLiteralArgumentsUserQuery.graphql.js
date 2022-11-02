/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f4538e842be3da8e9b6e8ba0f9b002a7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$fragmentType } from "./RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile.graphql";
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserQuery$variables = {||};
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile$fragmentType,
  |},
|};
export type RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserQuery = {|
  response: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserQuery$data,
  variables: RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserQuery",
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
            "name": "RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile"
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
    "name": "RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserQuery",
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
            "args": [
              {
                "kind": "Literal",
                "name": "size",
                "value": 42
              }
            ],
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
            "storageKey": "profilePicture(size:42)"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "e275ead1330a99bb6f38485c6b16cc8e",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserQuery {\n  me {\n    ...RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile\n    id\n  }\n}\n\nfragment RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfile on User {\n  id\n  ...RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture_1MOKfv\n}\n\nfragment RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserProfilePicture_1MOKfv on User {\n  profilePicture(size: 42) {\n    uri\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "2c16f719934bc159ff3d1ac97b4a681f";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserQuery$variables,
  RelayReaderTestCreatesFragmentPointersWithLiteralArgumentsUserQuery$data,
>*/);
