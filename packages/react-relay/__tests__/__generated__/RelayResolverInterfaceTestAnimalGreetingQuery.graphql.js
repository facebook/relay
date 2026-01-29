/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<87ea795183a44f4aa1db1ae95d9d297b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { Cat____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Cat____relay_model_instance.graphql";
import type { Fish____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Fish____relay_model_instance.graphql";
import {greeting as iAnimalGreetingResolverType} from "../../../relay-runtime/store/__tests__/resolvers/AnimalQueryResolvers.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `iAnimalGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(iAnimalGreetingResolverType: (
  model: Cat____relay_model_instance$data['__relay_model_instance'] | Fish____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
import {animal as queryAnimalResolverType} from "../../../relay-runtime/store/__tests__/resolvers/AnimalQueryResolvers.js";
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
export type RelayResolverInterfaceTestAnimalGreetingQuery$variables = {|
  request: AnimalRequest,
|};
export type RelayResolverInterfaceTestAnimalGreetingQuery$data = {|
  +animal: ?{|
    +greeting: ?string,
  |},
|};
export type RelayResolverInterfaceTestAnimalGreetingQuery = {|
  response: RelayResolverInterfaceTestAnimalGreetingQuery$data,
  variables: RelayResolverInterfaceTestAnimalGreetingQuery$variables,
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
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "greeting",
      "storageKey": null
    }
  ],
  "type": "Chicken",
  "abstractKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = [
  (v3/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolverInterfaceTestAnimalGreetingQuery",
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
            (v2/*: any*/),
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "fragment": {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "Cat____relay_model_instance"
                  },
                  "kind": "RelayResolver",
                  "name": "greeting",
                  "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Cat____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/AnimalQueryResolvers').greeting, '__relay_model_instance', true),
                  "path": "animal.greeting"
                }
              ],
              "type": "Cat",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "fragment": {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "Fish____relay_model_instance"
                  },
                  "kind": "RelayResolver",
                  "name": "greeting",
                  "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Fish____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/AnimalQueryResolvers').greeting, '__relay_model_instance', true),
                  "path": "animal.greeting"
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
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResolverInterfaceTestAnimalGreetingQuery",
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
            (v2/*: any*/),
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "name": "greeting",
                  "args": null,
                  "fragment": {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "name": "__relay_model_instance",
                        "args": null,
                        "fragment": {
                          "kind": "InlineFragment",
                          "selections": (v4/*: any*/),
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
                  "name": "greeting",
                  "args": null,
                  "fragment": {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "name": "__relay_model_instance",
                        "args": null,
                        "fragment": {
                          "kind": "InlineFragment",
                          "selections": (v4/*: any*/),
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
            (v3/*: any*/)
          ],
          "storageKey": null
        }
      }
    ]
  },
  "params": {
    "cacheID": "f2e014879af0e8c3a48b9048970e4c13",
    "id": null,
    "metadata": {},
    "name": "RelayResolverInterfaceTestAnimalGreetingQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d35e1f7778da7bfc45d34903bd3ca96c";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverInterfaceTestAnimalGreetingQuery$variables,
  RelayResolverInterfaceTestAnimalGreetingQuery$data,
>*/);
