/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5c3229b04f7816ed46671702db62500f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$ref = any;
export type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQueryVariables = {||};
export type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQueryResponse = {|
  +viewer: ?{|
    +actor: ?{|
      +$fragmentRefs: RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$ref,
    |},
  |},
|};
export type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQuery = {|
  variables: RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQueryVariables,
  response: RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile"
              }
            ],
            "storageKey": null
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
    "name": "RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  }
                ],
                "type": "User",
                "abstractKey": null
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "fe112a89c31ff3927497c97f39480053",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQuery {\n  viewer {\n    actor {\n      __typename\n      ...RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile\n      id\n    }\n  }\n}\n\nfragment RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "de40442fc17a47c16c0809a3cdc9acf7";
}

module.exports = node;
