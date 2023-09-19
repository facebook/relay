/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<377185ede62f3418a873b2ae07d58ba4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile$fragmentType } from "./RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile.graphql";
import type { RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile$fragmentType } from "./RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile.graphql";
export type RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataActorQuery$variables = {||};
export type RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataActorQuery$data = {|
  +viewer: ?{|
    +actor: ?{|
      +$fragmentSpreads: RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile$fragmentType & RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile$fragmentType,
    |},
  |},
|};
export type RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataActorQuery = {|
  response: RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataActorQuery$data,
  variables: RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataActorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataActorQuery",
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
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile"
                  }
                ],
                "type": "User",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile"
                  }
                ],
                "type": "Entity",
                "abstractKey": "__isEntity"
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
    "name": "RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataActorQuery",
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
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
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
                "kind": "TypeDiscriminator",
                "abstractKey": "__isEntity"
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
    "cacheID": "d05753c77330c4315f16e7c007af623d",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataActorQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataActorQuery {\n  viewer {\n    actor {\n      __typename\n      ... on User {\n        ...RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile\n      }\n      ... on Entity {\n        __isEntity: __typename\n        ...RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile\n      }\n      id\n    }\n  }\n}\n\nfragment RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataPageProfile on Page {\n  id\n}\n\nfragment RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataUserProfile on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "4e2c03b2d60d2f02742435a8c50f9af3";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataActorQuery$variables,
  RelayReaderTestShouldConsiderDataMissingIfOneOfTheFragmentTypesDoesNotMatchTheDataActorQuery$data,
>*/);
