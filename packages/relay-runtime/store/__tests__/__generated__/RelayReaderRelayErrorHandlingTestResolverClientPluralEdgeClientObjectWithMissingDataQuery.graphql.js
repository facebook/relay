/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<99d0ad1382218fdf9feea3c1e8967114>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { QueryAllAstrologicalSignsResolver$key } from "./../resolvers/__generated__/QueryAllAstrologicalSignsResolver.graphql";
import {all_astrological_signs as queryAllAstrologicalSignsResolverType} from "../resolvers/QueryAllAstrologicalSignsResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryAllAstrologicalSignsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryAllAstrologicalSignsResolverType: (
  rootKey: QueryAllAstrologicalSignsResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?ReadonlyArray<{|
  +id: DataID,
|}>);
export type RelayReaderRelayErrorHandlingTestResolverClientPluralEdgeClientObjectWithMissingDataQuery$variables = {||};
export type RelayReaderRelayErrorHandlingTestResolverClientPluralEdgeClientObjectWithMissingDataQuery$data = {|
  +all_astrological_signs: ?ReadonlyArray<{|
    +notes: ?string,
  |}>,
|};
export type RelayReaderRelayErrorHandlingTestResolverClientPluralEdgeClientObjectWithMissingDataQuery = {|
  response: RelayReaderRelayErrorHandlingTestResolverClientPluralEdgeClientObjectWithMissingDataQuery$data,
  variables: RelayReaderRelayErrorHandlingTestResolverClientPluralEdgeClientObjectWithMissingDataQuery$variables,
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
    "name": "RelayReaderRelayErrorHandlingTestResolverClientPluralEdgeClientObjectWithMissingDataQuery",
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
              "kind": "CatchField",
              "field": (v0/*: any*/),
              "to": "NULL"
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
    "name": "RelayReaderRelayErrorHandlingTestResolverClientPluralEdgeClientObjectWithMissingDataQuery",
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
    "cacheID": "815da3a9301c0c6b86eec7dcbe838001",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTestResolverClientPluralEdgeClientObjectWithMissingDataQuery",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTestResolverClientPluralEdgeClientObjectWithMissingDataQuery {\n  ...QueryAllAstrologicalSignsResolver\n}\n\nfragment QueryAllAstrologicalSignsResolver on Query {\n  me {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "643cec3823d195129218fe86f024fb41";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRelayErrorHandlingTestResolverClientPluralEdgeClientObjectWithMissingDataQuery$variables,
  RelayReaderRelayErrorHandlingTestResolverClientPluralEdgeClientObjectWithMissingDataQuery$data,
>*/);
