/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<cf4a77aa8f94f0c6b59d6b25107090fe>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { RelayResolverInterfaceTestAnimalLegsFragment$fragmentType } from "./RelayResolverInterfaceTestAnimalLegsFragment.graphql";
import {animals as queryAnimalsResolverType} from "../../../relay-runtime/store/__tests__/resolvers/AnimalQueryResolvers.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryAnimalsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryAnimalsResolverType: (
  args: {|
    requests: ReadonlyArray<AnimalRequest>,
  |},
  context: TestResolverContextType,
) => ?ReadonlyArray<?{|
  +__typename: "Cat" | "Chicken" | "Fish",
  +id: DataID,
|}>);
export type AnimalRequest = {|
  ofType: string,
  returnValidID: boolean,
|};
export type RelayResolverInterfaceTestAnimalsLegsQuery$variables = {|
  requests: ReadonlyArray<AnimalRequest>,
|};
export type RelayResolverInterfaceTestAnimalsLegsQuery$data = {|
  +animals: ?ReadonlyArray<?{|
    +id: string,
    +$fragmentSpreads: RelayResolverInterfaceTestAnimalLegsFragment$fragmentType,
  |}>,
|};
export type RelayResolverInterfaceTestAnimalsLegsQuery = {|
  response: RelayResolverInterfaceTestAnimalsLegsQuery$data,
  variables: RelayResolverInterfaceTestAnimalsLegsQuery$variables,
|};
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  (v2/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolverInterfaceTestAnimalsLegsQuery",
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
            "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Cat__id.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/CatResolvers').Cat, 'id', true),
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
            "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Fish__id.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/FishResolvers').Fish, 'id', true),
            "path": "animals.__relay_model_instance"
          }
        },
        "backingField": {
          "alias": null,
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "name": "animals",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/AnimalQueryResolvers').animals,
          "path": "animals"
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": null,
          "kind": "LinkedField",
          "name": "animals",
          "plural": true,
          "selections": [
            (v2/*: any*/),
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "RelayResolverInterfaceTestAnimalLegsFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResolverInterfaceTestAnimalsLegsQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "animals",
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": false
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*: any*/),
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
            (v2/*: any*/),
            {
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
            },
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "name": "legs",
                  "args": null,
                  "fragment": {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "name": "__relay_model_instance",
                        "args": null,
                        "fragment": {
                          "kind": "InlineFragment",
                          "selections": (v3/*: any*/),
                          "type": "Cat",
                          "abstractKey": null
                        },
                        "kind": "RelayResolver",
                        "storageKey": null,
                        "isOutputType": false
                      }
                    ],
                    "type": "Cat",
                    "abstractKey": null
                  },
                  "kind": "RelayResolver",
                  "storageKey": null,
                  "isOutputType": true
                }
              ],
              "type": "Cat",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "name": "legs",
                  "args": null,
                  "fragment": {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "name": "__relay_model_instance",
                        "args": null,
                        "fragment": {
                          "kind": "InlineFragment",
                          "selections": (v3/*: any*/),
                          "type": "Fish",
                          "abstractKey": null
                        },
                        "kind": "RelayResolver",
                        "storageKey": null,
                        "isOutputType": false
                      }
                    ],
                    "type": "Fish",
                    "abstractKey": null
                  },
                  "kind": "RelayResolver",
                  "storageKey": null,
                  "isOutputType": true
                }
              ],
              "type": "Fish",
              "abstractKey": null
            }
          ],
          "storageKey": null
        }
      }
    ],
    "clientAbstractTypes": {
      "__isIAnimal": [
        "Cat",
        "Chicken",
        "Fish"
      ]
    }
  },
  "params": {
    "cacheID": "26afdfc336da8d51fb00e39cc6026d8d",
    "id": null,
    "metadata": {},
    "name": "RelayResolverInterfaceTestAnimalsLegsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "04bfa405c479917657a2d15f6b8b3780";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverInterfaceTestAnimalsLegsQuery$variables,
  RelayResolverInterfaceTestAnimalsLegsQuery$data,
>*/);
