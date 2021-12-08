/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<03817d0943542ab3f51b10411a93f99d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$fragmentType = any;
export type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQuery$variables = {||};
export type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQueryVariables = RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQuery$variables;
export type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQuery$data = {|
  +viewer: ?{|
    +actor: ?{|
      +$fragmentSpreads: RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataUserProfile$fragmentType,
    |},
  |},
|};
export type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQueryResponse = RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQuery$data;
export type RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQuery = {|
  variables: RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQueryVariables,
  response: RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQuery$data,
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

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQuery$variables,
  RelayReaderTestShouldNotConsiderDataMissingIfTheFragmentTypeDoesNotMatchTheDataActorQuery$data,
>*/);
