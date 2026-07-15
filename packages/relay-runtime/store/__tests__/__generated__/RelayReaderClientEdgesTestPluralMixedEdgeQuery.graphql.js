/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b283735bb449915a8881504516c2c4e3>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import {animals as queryAnimalsResolverType} from "../resolvers/AnimalQueryResolvers.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryAnimalsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryAnimalsResolverType as (
  args: {
    requests: ReadonlyArray<AnimalRequest>,
  },
  context: TestResolverContextType,
) => ?ReadonlyArray<?{
  readonly __typename: "Cat" | "Chicken" | "Fish",
  readonly id: DataID,
}>);
export type AnimalRequest = {
  ofType: string,
  returnValidID: boolean,
};
export type RelayReaderClientEdgesTestPluralMixedEdgeQuery$variables = {
  requests: ReadonlyArray<AnimalRequest>,
};
export type RelayReaderClientEdgesTestPluralMixedEdgeQuery$data = {
  readonly animals: ?ReadonlyArray<?{
    readonly legs?: ?number,
  }>,
};
export type RelayReaderClientEdgesTestPluralMixedEdgeQuery = {
  response: RelayReaderClientEdgesTestPluralMixedEdgeQuery$data,
  variables: RelayReaderClientEdgesTestPluralMixedEdgeQuery$variables,
};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "requests"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "requests",
    "variableName": "requests"
  }
],
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "legs",
      "storageKey": null
    }
  ],
  "type": "Chicken",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayReaderClientEdgesTestPluralMixedEdgeQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": null,
        "modelResolvers": {
          "Cat": {
            "alias": null,
            "args": null,
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "Cat__id"
            },
            "kind": "RelayResolver",
            "name": "__relay_model_instance",
            "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../resolvers/__generated__/Cat__id.graphql'), require('../resolvers/CatResolvers').Cat, 'id', true),
            "path": "animals.__relay_model_instance"
          },
          "Fish": {
            "alias": null,
            "args": null,
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "Fish__id"
            },
            "kind": "RelayResolver",
            "name": "__relay_model_instance",
            "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../resolvers/__generated__/Fish__id.graphql'), require('../resolvers/FishResolvers').Fish, 'id', true),
            "path": "animals.__relay_model_instance"
          }
        },
        "serverObjectOperations": {
          "Chicken": require('./ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals.graphql')
        },
        "backingField": {
          "alias": null,
          "args": (v1/*:: as any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "name": "animals",
          "resolverModule": require('../resolvers/AnimalQueryResolvers').animals,
          "path": "animals"
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*:: as any*/),
          "concreteType": null,
          "kind": "LinkedField",
          "name": "animals",
          "plural": true,
          "selections": [
            (v2/*:: as any*/)
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayReaderClientEdgesTestPluralMixedEdgeQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "animals",
          "args": (v1/*:: as any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": false
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*:: as any*/),
          "concreteType": null,
          "kind": "LinkedField",
          "name": "animals",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "__typename",
              "storageKey": null
            },
            (v2/*:: as any*/),
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
      }
    ]
  },
  "params": {
    "cacheID": "5d18e70874a633aeb0e9a921fb70e0a6",
    "id": null,
    "metadata": {},
    "name": "RelayReaderClientEdgesTestPluralMixedEdgeQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "c269150bc8b81e02f100dad3641bbd60";
}

module.exports = ((node/*:: as any*/)/*:: as ClientQuery<
  RelayReaderClientEdgesTestPluralMixedEdgeQuery$variables,
  RelayReaderClientEdgesTestPluralMixedEdgeQuery$data,
>*/);
