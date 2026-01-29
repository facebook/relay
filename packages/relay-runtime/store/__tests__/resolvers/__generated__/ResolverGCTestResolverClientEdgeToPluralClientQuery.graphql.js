/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<53fb7999c9c76bbe516af2493f21b882>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { QueryAllAstrologicalSignsResolver$key } from "./QueryAllAstrologicalSignsResolver.graphql";
import {all_astrological_signs as queryAllAstrologicalSignsResolverType} from "../QueryAllAstrologicalSignsResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryAllAstrologicalSignsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryAllAstrologicalSignsResolverType: (
  rootKey: QueryAllAstrologicalSignsResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?ReadonlyArray<{|
  +id: DataID,
|}>);
export type ResolverGCTestResolverClientEdgeToPluralClientQuery$variables = {||};
export type ResolverGCTestResolverClientEdgeToPluralClientQuery$data = {|
  +all_astrological_signs: ?ReadonlyArray<{|
    +__id: string,
  |}>,
|};
export type ResolverGCTestResolverClientEdgeToPluralClientQuery = {|
  response: ResolverGCTestResolverClientEdgeToPluralClientQuery$data,
  variables: ResolverGCTestResolverClientEdgeToPluralClientQuery$variables,
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
    "name": "ResolverGCTestResolverClientEdgeToPluralClientQuery",
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
            "name": "QueryAllAstrologicalSignsResolver"
          },
          "kind": "RelayResolver",
          "name": "all_astrological_signs",
          "resolverModule": require('../QueryAllAstrologicalSignsResolver').all_astrological_signs,
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
            (v0/*: any*/)
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
    "name": "ResolverGCTestResolverClientEdgeToPluralClientQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "all_astrological_signs",
          "args": null,
          "fragment": {
            "kind": "InlineFragment",
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
                  (v1/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Query",
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
          "name": "all_astrological_signs",
          "plural": true,
          "selections": [
            (v0/*: any*/),
            (v1/*: any*/)
          ],
          "storageKey": null
        }
      }
    ]
  },
  "params": {
    "cacheID": "bd1b0a48508035f4d720f271fc284a21",
    "id": null,
    "metadata": {},
    "name": "ResolverGCTestResolverClientEdgeToPluralClientQuery",
    "operationKind": "query",
    "text": "query ResolverGCTestResolverClientEdgeToPluralClientQuery {\n  ...QueryAllAstrologicalSignsResolver\n}\n\nfragment QueryAllAstrologicalSignsResolver on Query {\n  me {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "036bd92cbd98ae61be666414bbc2d707";
}

module.exports = ((node/*: any*/)/*: Query<
  ResolverGCTestResolverClientEdgeToPluralClientQuery$variables,
  ResolverGCTestResolverClientEdgeToPluralClientQuery$data,
>*/);
