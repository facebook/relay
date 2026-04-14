/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bfa92a6ff1a8250f926cebef022dcf2b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { UserAstrologicalSignResolver$key } from "./../resolvers/__generated__/UserAstrologicalSignResolver.graphql";
import {astrological_sign as userAstrologicalSignResolverType} from "../resolvers/UserAstrologicalSignResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userAstrologicalSignResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userAstrologicalSignResolverType as (
  rootKey: UserAstrologicalSignResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type RelayReaderRelayErrorHandlingTestCatchOnClientEdgeClientObjectQuery$variables = {||};
export type RelayReaderRelayErrorHandlingTestCatchOnClientEdgeClientObjectQuery$data = {|
  +me: ?{|
    +astrological_sign: ?{|
      +notes: ?string,
    |},
  |},
|};
export type RelayReaderRelayErrorHandlingTestCatchOnClientEdgeClientObjectQuery = {|
  response: RelayReaderRelayErrorHandlingTestCatchOnClientEdgeClientObjectQuery$data,
  variables: RelayReaderRelayErrorHandlingTestCatchOnClientEdgeClientObjectQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "notes",
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
      "hasClientEdges": true,
      "throwOnFieldError": true
    },
    "name": "RelayReaderRelayErrorHandlingTestCatchOnClientEdgeClientObjectQuery",
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
            "kind": "CatchField",
            "field": {
              "kind": "ClientEdgeToClientObject",
              "concreteType": "AstrologicalSign",
              "modelResolvers": null,
              "serverObjectOperations": null,
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
                  (v0/*:: as any*/)
                ],
                "storageKey": null
              }
            },
            "to": "NULL"
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
    "name": "RelayReaderRelayErrorHandlingTestCatchOnClientEdgeClientObjectQuery",
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
                (v0/*:: as any*/),
                (v1/*:: as any*/)
              ],
              "storageKey": null
            }
          },
          (v1/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "99d8397c627bf014aaa07e8c7cec7434",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTestCatchOnClientEdgeClientObjectQuery",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTestCatchOnClientEdgeClientObjectQuery {\n  me {\n    ...UserAstrologicalSignResolver\n    id\n  }\n}\n\nfragment UserAstrologicalSignResolver on User {\n  birthdate {\n    month\n    day\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "52fa8fc497ebcc4eefb6193d8bfa1bf7";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderRelayErrorHandlingTestCatchOnClientEdgeClientObjectQuery$variables,
  RelayReaderRelayErrorHandlingTestCatchOnClientEdgeClientObjectQuery$data,
>*/);
