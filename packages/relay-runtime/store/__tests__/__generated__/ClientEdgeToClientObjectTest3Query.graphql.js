/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2305e9de2c013f48bf2d4b2e3d222bce>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { AstrologicalSignNameResolver$key } from "./../resolvers/__generated__/AstrologicalSignNameResolver.graphql";
import type { UserAstrologicalSignResolver$key } from "./../resolvers/__generated__/UserAstrologicalSignResolver.graphql";
import {name as astrologicalSignNameResolverType} from "../resolvers/AstrologicalSignNameResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `astrologicalSignNameResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignNameResolverType: (
  rootKey: AstrologicalSignNameResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
import {astrological_sign as userAstrologicalSignResolverType} from "../resolvers/UserAstrologicalSignResolver.js";
// Type assertion validating that `userAstrologicalSignResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userAstrologicalSignResolverType: (
  rootKey: UserAstrologicalSignResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type ClientEdgeToClientObjectTest3Query$variables = {||};
export type ClientEdgeToClientObjectTest3Query$data = {|
  +me: ?{|
    +astrological_sign: ?{|
      +__id: string,
      +name: ?string,
      +notes: ?string,
    |},
  |},
|};
export type ClientEdgeToClientObjectTest3Query = {|
  response: ClientEdgeToClientObjectTest3Query$data,
  variables: ClientEdgeToClientObjectTest3Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "notes",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
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
            "modelResolvers": null,
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
              "resolverModule": require('../resolvers/UserAstrologicalSignResolver').astrological_sign,
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
                (v0/*: any*/),
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
                  "resolverModule": require('../resolvers/AstrologicalSignNameResolver').name,
                  "path": "me.astrological_sign.name"
                },
                (v1/*: any*/)
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
            "kind": "ClientEdgeToClientObject",
            "backingField": {
              "name": "astrological_sign",
              "args": null,
              "fragment": {
                "kind": "InlineFragment",
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
                  }
                ],
                "type": "User",
                "abstractKey": null
              },
              "kind": "RelayResolver",
              "storageKey": null,
              "isOutputType": false
            },
            "linkedField": {
              "alias": null,
              "args": null,
              "concreteType": "AstrologicalSign",
              "kind": "LinkedField",
              "name": "astrological_sign",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "name": "name",
                  "args": null,
                  "fragment": {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "name": "self",
                        "args": null,
                        "fragment": {
                          "kind": "InlineFragment",
                          "selections": [
                            (v2/*: any*/)
                          ],
                          "type": "AstrologicalSign",
                          "abstractKey": null
                        },
                        "kind": "RelayResolver",
                        "storageKey": null,
                        "isOutputType": true
                      }
                    ],
                    "type": "AstrologicalSign",
                    "abstractKey": null
                  },
                  "kind": "RelayResolver",
                  "storageKey": null,
                  "isOutputType": true
                },
                (v1/*: any*/),
                (v2/*: any*/)
              ],
              "storageKey": null
            }
          },
          (v2/*: any*/)
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
})();

if (__DEV__) {
  (node/*: any*/).hash = "c0bf4abbfd5f064e3fa3f5da531b725c";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeToClientObjectTest3Query$variables,
  ClientEdgeToClientObjectTest3Query$data,
>*/);
