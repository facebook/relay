/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9260d2f53d0ef75e100dfce9161fd9c6>>
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
import type { QueryAllAstrologicalSignsResolver$key } from "./../resolvers/__generated__/QueryAllAstrologicalSignsResolver.graphql";
import {name as astrologicalSignNameResolverType} from "../resolvers/AstrologicalSignNameResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `astrologicalSignNameResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignNameResolverType: (
  rootKey: AstrologicalSignNameResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
import {all_astrological_signs as queryAllAstrologicalSignsResolverType} from "../resolvers/QueryAllAstrologicalSignsResolver.js";
// Type assertion validating that `queryAllAstrologicalSignsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryAllAstrologicalSignsResolverType: (
  rootKey: QueryAllAstrologicalSignsResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?ReadonlyArray<{|
  +id: DataID,
|}>);
export type ClientEdgeToClientObjectTest2Query$variables = {||};
export type ClientEdgeToClientObjectTest2Query$data = {|
  +all_astrological_signs: ?ReadonlyArray<{|
    +name: ?string,
  |}>,
|};
export type ClientEdgeToClientObjectTest2Query = {|
  response: ClientEdgeToClientObjectTest2Query$data,
  variables: ClientEdgeToClientObjectTest2Query$variables,
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
    "name": "ClientEdgeToClientObjectTest2Query",
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
          "resolverModule": require('../resolvers/QueryAllAstrologicalSignsResolver').all_astrological_signs,
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
              "resolverModule": require('../resolvers/AstrologicalSignNameResolver').name,
              "path": "all_astrological_signs.name"
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
                  (v0/*: any*/)
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
})();

if (__DEV__) {
  (node/*: any*/).hash = "b03fba0ae5a32ea645e8614e2f612822";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeToClientObjectTest2Query$variables,
  ClientEdgeToClientObjectTest2Query$data,
>*/);
