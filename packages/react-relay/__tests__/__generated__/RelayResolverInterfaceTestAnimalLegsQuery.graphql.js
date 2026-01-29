/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<62c5f010d33fc347393ac7b3fc0723db>>
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
import {animal as queryAnimalResolverType} from "../../../relay-runtime/store/__tests__/resolvers/AnimalQueryResolvers.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryAnimalResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryAnimalResolverType: (
  args: {|
    request: AnimalRequest,
  |},
  context: TestResolverContextType,
) => ?{|
  +__typename: "Cat" | "Chicken" | "Fish",
  +id: DataID,
|});
export type AnimalRequest = {|
  ofType: string,
  returnValidID: boolean,
|};
export type RelayResolverInterfaceTestAnimalLegsQuery$variables = {|
  request: AnimalRequest,
|};
export type RelayResolverInterfaceTestAnimalLegsQuery$data = {|
  +animal: ?{|
    +$fragmentSpreads: RelayResolverInterfaceTestAnimalLegsFragment$fragmentType,
  |},
|};
export type RelayResolverInterfaceTestAnimalLegsQuery = {|
  response: RelayResolverInterfaceTestAnimalLegsQuery$data,
  variables: RelayResolverInterfaceTestAnimalLegsQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "request"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "request",
    "variableName": "request"
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
    "name": "RelayResolverInterfaceTestAnimalLegsQuery",
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
            "path": "animal.__relay_model_instance"
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
            "path": "animal.__relay_model_instance"
          }
        },
        "backingField": {
          "alias": null,
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "name": "animal",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/AnimalQueryResolvers').animal,
          "path": "animal"
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": null,
          "kind": "LinkedField",
          "name": "animal",
          "plural": false,
          "selections": [
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
    "name": "RelayResolverInterfaceTestAnimalLegsQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "animal",
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
          "name": "animal",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "__typename",
              "storageKey": null
            },
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
            },
            (v2/*: any*/)
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
    "cacheID": "f240e73f777c2a51a0622d85c36fbcb9",
    "id": null,
    "metadata": {},
    "name": "RelayResolverInterfaceTestAnimalLegsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "30ac22964e5c349d28a0d6c199793b8f";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverInterfaceTestAnimalLegsQuery$variables,
  RelayResolverInterfaceTestAnimalLegsQuery$data,
>*/);
