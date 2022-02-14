/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<466d637062eccf03778ed189f2a18a4a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderTestReadsBasicFragmentUserProfile$fragmentType = any;
export type RelayReaderTestReadsBasicFragmentUserQuery$variables = {||};
export type RelayReaderTestReadsBasicFragmentUserQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestReadsBasicFragmentUserProfile$fragmentType,
  |},
|};
export type RelayReaderTestReadsBasicFragmentUserQuery = {|
  variables: RelayReaderTestReadsBasicFragmentUserQuery$variables,
  response: RelayReaderTestReadsBasicFragmentUserQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestReadsBasicFragmentUserQuery",
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
            "name": "RelayReaderTestReadsBasicFragmentUserProfile"
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
    "name": "RelayReaderTestReadsBasicFragmentUserQuery",
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
                "value": 32
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
            "storageKey": "profilePicture(size:32)"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d69a565e1daa8a0a2ef82dc6c7a619a2",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestReadsBasicFragmentUserQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestReadsBasicFragmentUserQuery {\n  me {\n    ...RelayReaderTestReadsBasicFragmentUserProfile\n    id\n  }\n}\n\nfragment RelayReaderTestReadsBasicFragmentUserProfile on User {\n  id\n  ...RelayReaderTestReadsBasicFragmentUserProfilePicture\n}\n\nfragment RelayReaderTestReadsBasicFragmentUserProfilePicture on User {\n  profilePicture(size: 32) {\n    uri\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "2401429f098b7810eaab00ff36642660";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestReadsBasicFragmentUserQuery$variables,
  RelayReaderTestReadsBasicFragmentUserQuery$data,
>*/);
