/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9f64372a6da65518e08738d9995a0961>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { AstrologicalSignNameResolver$key } from "./AstrologicalSignNameResolver.graphql";
import type { UserAstrologicalSignResolver$key } from "./UserAstrologicalSignResolver.graphql";
import {name as astrologicalSignNameResolverType} from "../AstrologicalSignNameResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `astrologicalSignNameResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignNameResolverType: (
  rootKey: AstrologicalSignNameResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
import {astrological_sign as userAstrologicalSignResolverType} from "../UserAstrologicalSignResolver.js";
// Type assertion validating that `userAstrologicalSignResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userAstrologicalSignResolverType: (
  rootKey: UserAstrologicalSignResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type ResolverGCTestResolverClientEdgeToClientDirtyQuery$variables = {||};
export type ResolverGCTestResolverClientEdgeToClientDirtyQuery$data = {|
  +me: ?{|
    +astrological_sign: ?{|
      +name: ?string,
    |},
  |},
|};
export type ResolverGCTestResolverClientEdgeToClientDirtyQuery = {|
  response: ResolverGCTestResolverClientEdgeToClientDirtyQuery$data,
  variables: ResolverGCTestResolverClientEdgeToClientDirtyQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
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
    "name": "ResolverGCTestResolverClientEdgeToClientDirtyQuery",
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
              "resolverModule": require('../UserAstrologicalSignResolver').astrological_sign,
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
                  "fragment": {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "AstrologicalSignNameResolver"
                  },
                  "kind": "RelayResolver",
                  "name": "name",
                  "resolverModule": require('../AstrologicalSignNameResolver').name,
                  "path": "me.astrological_sign.name"
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
    "name": "ResolverGCTestResolverClientEdgeToClientDirtyQuery",
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
                            (v0/*: any*/)
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
                (v0/*: any*/)
              ],
              "storageKey": null
            }
          },
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "25ccd0573d045cb0dd23e0f7a4430fa2",
    "id": null,
    "metadata": {},
    "name": "ResolverGCTestResolverClientEdgeToClientDirtyQuery",
    "operationKind": "query",
    "text": "query ResolverGCTestResolverClientEdgeToClientDirtyQuery {\n  me {\n    ...UserAstrologicalSignResolver\n    id\n  }\n}\n\nfragment UserAstrologicalSignResolver on User {\n  birthdate {\n    month\n    day\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d4a8390f4ccdcf6fa11c81b61530e7fe";
}

module.exports = ((node/*: any*/)/*: Query<
  ResolverGCTestResolverClientEdgeToClientDirtyQuery$variables,
  ResolverGCTestResolverClientEdgeToClientDirtyQuery$data,
>*/);
