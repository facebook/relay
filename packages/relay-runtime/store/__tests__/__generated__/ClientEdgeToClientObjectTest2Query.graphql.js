/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f9bc5c20a30d8edaeb33da89a63e3db2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type AstrologicalSignNameResolver$key = any;
type QueryAllAstrologicalSignsResolver$key = any;
import astrologicalSignNameResolver from "../resolvers/AstrologicalSignNameResolver.js";
// Type assertion validating that `astrologicalSignNameResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignNameResolver: (
  rootKey: AstrologicalSignNameResolver$key, 
) => mixed);
import queryAllAstrologicalSignsResolver from "../resolvers/QueryAllAstrologicalSignsResolver.js";
// Type assertion validating that `queryAllAstrologicalSignsResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryAllAstrologicalSignsResolver: (
  rootKey: QueryAllAstrologicalSignsResolver$key, 
) => mixed);
export type ClientEdgeToClientObjectTest2Query$variables = {||};
export type ClientEdgeToClientObjectTest2Query$data = {|
  +all_astrological_signs: ?$ReadOnlyArray<?{|
    +name: ?$Call<<R>((...empty[]) => R) => R, typeof astrologicalSignNameResolver>,
  |}>,
|};
export type ClientEdgeToClientObjectTest2Query = {|
  response: ClientEdgeToClientObjectTest2Query$data,
  variables: ClientEdgeToClientObjectTest2Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "ClientEdgeToClientObjectTest2Query",
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
            "name": "QueryAllAstrologicalSignsResolver"
          },
          "kind": "RelayResolver",
          "name": "all_astrological_signs",
          "resolverModule": require('./../resolvers/QueryAllAstrologicalSignsResolver.js'),
          "path": "all_astrological_signs"
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "AstrologicalSign",
          "kind": "LinkedField",
          "name": "all_astrological_signs",
          "plural": true,
          "selections": [
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
              "resolverModule": require('./../resolvers/AstrologicalSignNameResolver.js'),
              "path": "name"
            }
          ],
          "storageKey": null
        }
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ClientEdgeToClientObjectTest2Query",
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
            "name": "__typename",
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
    "cacheID": "683b1464c283504244b512ec825ea94d",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeToClientObjectTest2Query",
    "operationKind": "query",
    "text": "query ClientEdgeToClientObjectTest2Query {\n  ...QueryAllAstrologicalSignsResolver\n}\n\nfragment QueryAllAstrologicalSignsResolver on Query {\n  me {\n    __typename\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "b03fba0ae5a32ea645e8614e2f612822";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeToClientObjectTest2Query$variables,
  ClientEdgeToClientObjectTest2Query$data,
>*/);
