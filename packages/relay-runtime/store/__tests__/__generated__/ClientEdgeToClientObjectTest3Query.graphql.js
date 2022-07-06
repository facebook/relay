/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1991bcca2be185d5f67c05f9c6bac973>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type AstrologicalSignNameResolver$key = any;
type UserAstrologicalSignResolver$key = any;
import astrologicalSignNameResolver from "../resolvers/AstrologicalSignNameResolver.js";
// Type assertion validating that `astrologicalSignNameResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignNameResolver: (
  rootKey: AstrologicalSignNameResolver$key, 
) => mixed);
import userAstrologicalSignResolver from "../resolvers/UserAstrologicalSignResolver.js";
// Type assertion validating that `userAstrologicalSignResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userAstrologicalSignResolver: (
  rootKey: UserAstrologicalSignResolver$key, 
) => mixed);
export type ClientEdgeToClientObjectTest3Query$variables = {||};
export type ClientEdgeToClientObjectTest3Query$data = {|
  +me: ?{|
    +astrological_sign: ?{|
      +__id: string,
      +name: ?$Call<<R>((...empty[]) => R) => R, typeof astrologicalSignNameResolver>,
      +notes: ?string,
    |},
  |},
|};
export type ClientEdgeToClientObjectTest3Query = {|
  response: ClientEdgeToClientObjectTest3Query$data,
  variables: ClientEdgeToClientObjectTest3Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "ClientEdgeToClientObjectTest3Query",
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
            "kind": "ClientEdgeToClientObject",
            "concreteType": "AstrologicalSign",
            "backingField": {
              "alias": null,
              "args": null,
              "fragment": {
                "args": null,
                "kind": "FragmentSpread",
                "name": "UserAstrologicalSignResolver"
              },
              "kind": "RelayResolver",
              "name": "astrological_sign",
              "resolverModule": require('./../resolvers/UserAstrologicalSignResolver'),
              "path": "me.astrological_sign"
            },
            "linkedField": {
              "alias": null,
              "args": null,
              "concreteType": "AstrologicalSign",
              "kind": "LinkedField",
              "name": "astrological_sign",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__id",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "fragment": {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "AstrologicalSignNameResolver"
                  },
                  "kind": "RelayResolver",
                  "name": "name",
                  "resolverModule": require('./../resolvers/AstrologicalSignNameResolver'),
                  "path": "me.name"
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "notes",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
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
    "name": "ClientEdgeToClientObjectTest3Query",
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
            "concreteType": "Date",
            "kind": "LinkedField",
            "name": "birthdate",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "month",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "day",
                "storageKey": null
              }
            ],
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
    "cacheID": "9733729d389fdc980e2baf836012b39e",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeToClientObjectTest3Query",
    "operationKind": "query",
    "text": "query ClientEdgeToClientObjectTest3Query {\n  me {\n    ...UserAstrologicalSignResolver\n    id\n  }\n}\n\nfragment UserAstrologicalSignResolver on User {\n  birthdate {\n    month\n    day\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "c0bf4abbfd5f064e3fa3f5da531b725c";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeToClientObjectTest3Query$variables,
  ClientEdgeToClientObjectTest3Query$data,
>*/);
