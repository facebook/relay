/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3983ea2457c99cb128c5e472f2360785>>
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
import type { AstrologicalSignOppositeResolver$key } from "./AstrologicalSignOppositeResolver.graphql";
import type { UserAstrologicalSignResolver$key } from "./UserAstrologicalSignResolver.graphql";
import {name as astrologicalSignNameResolverType} from "../AstrologicalSignNameResolver.js";
// Type assertion validating that `astrologicalSignNameResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignNameResolverType: (
  rootKey: AstrologicalSignNameResolver$key,
) => mixed);
import {opposite as astrologicalSignOppositeResolverType} from "../AstrologicalSignOppositeResolver.js";
// Type assertion validating that `astrologicalSignOppositeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignOppositeResolverType: (
  rootKey: AstrologicalSignOppositeResolver$key,
) => ?{|
  +id: DataID,
|});
import {astrological_sign as userAstrologicalSignResolverType} from "../UserAstrologicalSignResolver.js";
// Type assertion validating that `userAstrologicalSignResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userAstrologicalSignResolverType: (
  rootKey: UserAstrologicalSignResolver$key,
) => ?{|
  +id: DataID,
|});
export type ResolverGCTestResolverClientEdgeToClientRecursiveQuery$variables = {||};
export type ResolverGCTestResolverClientEdgeToClientRecursiveQuery$data = {|
  +me: ?{|
    +astrological_sign: ?{|
      +name: ?$Call<<R>((...empty[]) => R) => R, typeof astrologicalSignNameResolverType>,
      +opposite: ?{|
        +name: ?$Call<<R>((...empty[]) => R) => R, typeof astrologicalSignNameResolverType>,
      |},
    |},
  |},
|};
export type ResolverGCTestResolverClientEdgeToClientRecursiveQuery = {|
  response: ResolverGCTestResolverClientEdgeToClientRecursiveQuery$data,
  variables: ResolverGCTestResolverClientEdgeToClientRecursiveQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "fragment": {
    "args": null,
    "kind": "FragmentSpread",
    "name": "AstrologicalSignNameResolver"
  },
  "kind": "RelayResolver",
  "name": "name",
  "resolverModule": require('./../AstrologicalSignNameResolver').name,
  "path": "me.name"
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "name": "self",
      "args": null,
      "fragment": {
        "kind": "InlineFragment",
        "selections": [
          (v1/*: any*/)
        ],
        "type": "AstrologicalSign",
        "abstractKey": null
      },
      "kind": "RelayResolver",
      "storageKey": null,
      "isOutputType": false
    }
  ],
  "type": "AstrologicalSign",
  "abstractKey": null
},
v3 = {
  "name": "name",
  "args": null,
  "fragment": (v2/*: any*/),
  "kind": "RelayResolver",
  "storageKey": null,
  "isOutputType": false
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "ResolverGCTestResolverClientEdgeToClientRecursiveQuery",
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
              "resolverModule": require('./../UserAstrologicalSignResolver').astrological_sign,
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
                  "kind": "ClientEdgeToClientObject",
                  "concreteType": "AstrologicalSign",
                  "backingField": {
                    "alias": null,
                    "args": null,
                    "fragment": {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "AstrologicalSignOppositeResolver"
                    },
                    "kind": "RelayResolver",
                    "name": "opposite",
                    "resolverModule": require('./../AstrologicalSignOppositeResolver').opposite,
                    "path": "me.opposite"
                  },
                  "linkedField": {
                    "alias": null,
                    "args": null,
                    "concreteType": "AstrologicalSign",
                    "kind": "LinkedField",
                    "name": "opposite",
                    "plural": false,
                    "selections": [
                      (v0/*: any*/)
                    ],
                    "storageKey": null
                  }
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
    "name": "ResolverGCTestResolverClientEdgeToClientRecursiveQuery",
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
                (v3/*: any*/),
                {
                  "kind": "ClientEdgeToClientObject",
                  "backingField": {
                    "name": "opposite",
                    "args": null,
                    "fragment": (v2/*: any*/),
                    "kind": "RelayResolver",
                    "storageKey": null,
                    "isOutputType": false
                  },
                  "linkedField": {
                    "alias": null,
                    "args": null,
                    "concreteType": "AstrologicalSign",
                    "kind": "LinkedField",
                    "name": "opposite",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  }
                },
                (v1/*: any*/)
              ],
              "storageKey": null
            }
          },
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "707b0ffa4f2cbdd22caeedd9025e9c40",
    "id": null,
    "metadata": {},
    "name": "ResolverGCTestResolverClientEdgeToClientRecursiveQuery",
    "operationKind": "query",
    "text": "query ResolverGCTestResolverClientEdgeToClientRecursiveQuery {\n  me {\n    ...UserAstrologicalSignResolver\n    id\n  }\n}\n\nfragment UserAstrologicalSignResolver on User {\n  birthdate {\n    month\n    day\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "835710d0d7baf55862e8c7a7e122b64c";
}

module.exports = ((node/*: any*/)/*: Query<
  ResolverGCTestResolverClientEdgeToClientRecursiveQuery$variables,
  ResolverGCTestResolverClientEdgeToClientRecursiveQuery$data,
>*/);
