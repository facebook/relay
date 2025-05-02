/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<721f227a2dacdaad832c941fa734ffd7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { LiveState, DataID } from "relay-runtime";
import type { AstrologicalSignNameResolver$key } from "./AstrologicalSignNameResolver.graphql";
import {name as astrologicalSignNameResolverType} from "../AstrologicalSignNameResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `astrologicalSignNameResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignNameResolverType: (
  rootKey: AstrologicalSignNameResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
import {virgo_suspends_when_counter_is_odd as queryVirgoSuspendsWhenCounterIsOddResolverType} from "../QueryVirgoLiveSuspendsWhenOddResolver.js";
// Type assertion validating that `queryVirgoSuspendsWhenCounterIsOddResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryVirgoSuspendsWhenCounterIsOddResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?{|
  +id: DataID,
|}>);
export type ResolverGCTestResolverClientEdgeToClientSuspendedQuery$variables = {||};
export type ResolverGCTestResolverClientEdgeToClientSuspendedQuery$data = {|
  +me: ?{|
    +__typename: "User",
  |},
  +virgo_suspends_when_counter_is_odd: ?{|
    +name: ?string,
  |},
|};
export type ResolverGCTestResolverClientEdgeToClientSuspendedQuery = {|
  response: ResolverGCTestResolverClientEdgeToClientSuspendedQuery$data,
  variables: ResolverGCTestResolverClientEdgeToClientSuspendedQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
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
    "name": "ResolverGCTestResolverClientEdgeToClientSuspendedQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "AstrologicalSign",
        "modelResolvers": null,
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayLiveResolver",
          "name": "virgo_suspends_when_counter_is_odd",
          "resolverModule": require('../QueryVirgoLiveSuspendsWhenOddResolver').virgo_suspends_when_counter_is_odd,
          "path": "virgo_suspends_when_counter_is_odd"
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "AstrologicalSign",
          "kind": "LinkedField",
          "name": "virgo_suspends_when_counter_is_odd",
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
              "path": "virgo_suspends_when_counter_is_odd.name"
            }
          ],
          "storageKey": null
        }
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/)
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
    "name": "ResolverGCTestResolverClientEdgeToClientSuspendedQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "virgo_suspends_when_counter_is_odd",
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": false
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "AstrologicalSign",
          "kind": "LinkedField",
          "name": "virgo_suspends_when_counter_is_odd",
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
                        (v1/*: any*/)
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
            (v1/*: any*/)
          ],
          "storageKey": null
        }
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9291bae634cbccee3c7a5074a3ff9c40",
    "id": null,
    "metadata": {},
    "name": "ResolverGCTestResolverClientEdgeToClientSuspendedQuery",
    "operationKind": "query",
    "text": "query ResolverGCTestResolverClientEdgeToClientSuspendedQuery {\n  me {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "dd0a273ac98c59f8fb96a349e801ad6d";
}

module.exports = ((node/*: any*/)/*: Query<
  ResolverGCTestResolverClientEdgeToClientSuspendedQuery$variables,
  ResolverGCTestResolverClientEdgeToClientSuspendedQuery$data,
>*/);
