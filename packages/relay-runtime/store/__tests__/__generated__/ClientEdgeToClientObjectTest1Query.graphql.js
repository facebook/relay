/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<23f93b7b8672df5dd26cabb896319e70>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { AstrologicalSignHouseResolver$key } from "./../resolvers/__generated__/AstrologicalSignHouseResolver.graphql";
import type { AstrologicalSignNameResolver$key } from "./../resolvers/__generated__/AstrologicalSignNameResolver.graphql";
import type { AstrologicalSignOppositeResolver$key } from "./../resolvers/__generated__/AstrologicalSignOppositeResolver.graphql";
import type { UserAstrologicalSignResolver$key } from "./../resolvers/__generated__/UserAstrologicalSignResolver.graphql";
import {house as astrologicalSignHouseResolverType} from "../resolvers/AstrologicalSignHouseResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `astrologicalSignHouseResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignHouseResolverType: (
  rootKey: AstrologicalSignHouseResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?number);
import {name as astrologicalSignNameResolverType} from "../resolvers/AstrologicalSignNameResolver.js";
// Type assertion validating that `astrologicalSignNameResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignNameResolverType: (
  rootKey: AstrologicalSignNameResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
import {opposite as astrologicalSignOppositeResolverType} from "../resolvers/AstrologicalSignOppositeResolver.js";
// Type assertion validating that `astrologicalSignOppositeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignOppositeResolverType: (
  rootKey: AstrologicalSignOppositeResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
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
export type ClientEdgeToClientObjectTest1Query$variables = {||};
export type ClientEdgeToClientObjectTest1Query$data = {|
  +me: ?{|
    +astrological_sign: ?{|
      +__id: string,
      +house: ?number,
      +name: ?string,
      +opposite: ?{|
        +__id: string,
        +house: ?number,
        +name: ?string,
        +opposite: ?{|
          +__id: string,
          +name: ?string,
        |},
      |},
    |},
  |},
|};
export type ClientEdgeToClientObjectTest1Query = {|
  response: ClientEdgeToClientObjectTest1Query$data,
  variables: ClientEdgeToClientObjectTest1Query$variables,
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
  "args": null,
  "kind": "FragmentSpread",
  "name": "AstrologicalSignNameResolver"
},
v2 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "AstrologicalSignHouseResolver"
},
v3 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "AstrologicalSignOppositeResolver"
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "name": "self",
      "args": null,
      "fragment": {
        "kind": "InlineFragment",
        "selections": [
          (v4/*: any*/)
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
v6 = {
  "name": "name",
  "args": null,
  "fragment": (v5/*: any*/),
  "kind": "RelayResolver",
  "storageKey": null,
  "isOutputType": true
},
v7 = {
  "name": "house",
  "args": null,
  "fragment": (v5/*: any*/),
  "kind": "RelayResolver",
  "storageKey": null,
  "isOutputType": true
},
v8 = {
  "name": "opposite",
  "args": null,
  "fragment": (v5/*: any*/),
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
    "name": "ClientEdgeToClientObjectTest1Query",
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
                  "fragment": (v1/*: any*/),
                  "kind": "RelayResolver",
                  "name": "name",
                  "resolverModule": require('../resolvers/AstrologicalSignNameResolver').name,
                  "path": "me.astrological_sign.name"
                },
                {
                  "alias": null,
                  "args": null,
                  "fragment": (v2/*: any*/),
                  "kind": "RelayResolver",
                  "name": "house",
                  "resolverModule": require('../resolvers/AstrologicalSignHouseResolver').house,
                  "path": "me.astrological_sign.house"
                },
                {
                  "kind": "ClientEdgeToClientObject",
                  "concreteType": "AstrologicalSign",
                  "modelResolvers": null,
                  "backingField": {
                    "alias": null,
                    "args": null,
                    "fragment": (v3/*: any*/),
                    "kind": "RelayResolver",
                    "name": "opposite",
                    "resolverModule": require('../resolvers/AstrologicalSignOppositeResolver').opposite,
                    "path": "me.astrological_sign.opposite"
                  },
                  "linkedField": {
                    "alias": null,
                    "args": null,
                    "concreteType": "AstrologicalSign",
                    "kind": "LinkedField",
                    "name": "opposite",
                    "plural": false,
                    "selections": [
                      (v0/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "fragment": (v1/*: any*/),
                        "kind": "RelayResolver",
                        "name": "name",
                        "resolverModule": require('../resolvers/AstrologicalSignNameResolver').name,
                        "path": "me.astrological_sign.opposite.name"
                      },
                      {
                        "alias": null,
                        "args": null,
                        "fragment": (v2/*: any*/),
                        "kind": "RelayResolver",
                        "name": "house",
                        "resolverModule": require('../resolvers/AstrologicalSignHouseResolver').house,
                        "path": "me.astrological_sign.opposite.house"
                      },
                      {
                        "kind": "ClientEdgeToClientObject",
                        "concreteType": "AstrologicalSign",
                        "modelResolvers": null,
                        "backingField": {
                          "alias": null,
                          "args": null,
                          "fragment": (v3/*: any*/),
                          "kind": "RelayResolver",
                          "name": "opposite",
                          "resolverModule": require('../resolvers/AstrologicalSignOppositeResolver').opposite,
                          "path": "me.astrological_sign.opposite.opposite"
                        },
                        "linkedField": {
                          "alias": null,
                          "args": null,
                          "concreteType": "AstrologicalSign",
                          "kind": "LinkedField",
                          "name": "opposite",
                          "plural": false,
                          "selections": [
                            (v0/*: any*/),
                            {
                              "alias": null,
                              "args": null,
                              "fragment": (v1/*: any*/),
                              "kind": "RelayResolver",
                              "name": "name",
                              "resolverModule": require('../resolvers/AstrologicalSignNameResolver').name,
                              "path": "me.astrological_sign.opposite.opposite.name"
                            }
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
    "name": "ClientEdgeToClientObjectTest1Query",
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
                (v6/*: any*/),
                (v7/*: any*/),
                {
                  "kind": "ClientEdgeToClientObject",
                  "backingField": (v8/*: any*/),
                  "linkedField": {
                    "alias": null,
                    "args": null,
                    "concreteType": "AstrologicalSign",
                    "kind": "LinkedField",
                    "name": "opposite",
                    "plural": false,
                    "selections": [
                      (v0/*: any*/),
                      (v6/*: any*/),
                      (v7/*: any*/),
                      {
                        "kind": "ClientEdgeToClientObject",
                        "backingField": (v8/*: any*/),
                        "linkedField": {
                          "alias": null,
                          "args": null,
                          "concreteType": "AstrologicalSign",
                          "kind": "LinkedField",
                          "name": "opposite",
                          "plural": false,
                          "selections": [
                            (v0/*: any*/),
                            (v6/*: any*/),
                            (v4/*: any*/)
                          ],
                          "storageKey": null
                        }
                      },
                      (v4/*: any*/)
                    ],
                    "storageKey": null
                  }
                },
                (v4/*: any*/)
              ],
              "storageKey": null
            }
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "635bfa029f7924c62673e82fa8c7fd8c",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeToClientObjectTest1Query",
    "operationKind": "query",
    "text": "query ClientEdgeToClientObjectTest1Query {\n  me {\n    ...UserAstrologicalSignResolver\n    id\n  }\n}\n\nfragment UserAstrologicalSignResolver on User {\n  birthdate {\n    month\n    day\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9eb5b7395eb332f56c571706e3dd725a";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeToClientObjectTest1Query$variables,
  ClientEdgeToClientObjectTest1Query$data,
>*/);
