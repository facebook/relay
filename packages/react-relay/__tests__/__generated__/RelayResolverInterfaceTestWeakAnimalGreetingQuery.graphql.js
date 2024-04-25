/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<57ab71a3878a337d4b8f83de98ef03a0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { Octopus____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Octopus____relay_model_instance.graphql";
import type { PurpleOctopus____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/PurpleOctopus____relay_model_instance.graphql";
import {greeting as iWeakAnimalGreetingResolverType} from "../../../relay-runtime/store/__tests__/resolvers/WeakAnimalQueryResolvers.js";
// Type assertion validating that `iWeakAnimalGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(iWeakAnimalGreetingResolverType: (
  model: Octopus____relay_model_instance$data['__relay_model_instance'] | PurpleOctopus____relay_model_instance$data['__relay_model_instance'],
) => ?string);
import {weak_animal as queryWeakAnimalResolverType} from "../../../relay-runtime/store/__tests__/resolvers/WeakAnimalQueryResolvers.js";
// Type assertion validating that `queryWeakAnimalResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryWeakAnimalResolverType: (
  args: {|
    request: WeakAnimalRequest,
  |},
) => ?Query__weak_animal$normalization);
import type { Query__weak_animal$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__weak_animal$normalization.graphql";
export type WeakAnimalRequest = {|
  ofType: string,
|};
export type RelayResolverInterfaceTestWeakAnimalGreetingQuery$variables = {|
  request: WeakAnimalRequest,
|};
export type RelayResolverInterfaceTestWeakAnimalGreetingQuery$data = {|
  +weak_animal: ?{|
    +greeting: ?string,
  |},
|};
export type RelayResolverInterfaceTestWeakAnimalGreetingQuery = {|
  response: RelayResolverInterfaceTestWeakAnimalGreetingQuery$data,
  variables: RelayResolverInterfaceTestWeakAnimalGreetingQuery$variables,
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
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "__relay_model_instance",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolverInterfaceTestWeakAnimalGreetingQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": null,
        "modelResolvers": null,
        "backingField": {
          "alias": null,
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "name": "weak_animal",
          "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/WeakAnimalQueryResolvers').weak_animal,
          "path": "weak_animal",
          "normalizationInfo": {
            "kind": "OutputType",
            "concreteType": null,
            "plural": false,
            "normalizationNode": require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__weak_animal$normalization.graphql')
          }
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": null,
          "kind": "LinkedField",
          "name": "weak_animal",
          "plural": false,
          "selections": [
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "fragment": {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "Octopus____relay_model_instance"
                  },
                  "kind": "RelayResolver",
                  "name": "greeting",
                  "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Octopus____relay_model_instance.graphql'), require('./../../../relay-runtime/store/__tests__/resolvers/WeakAnimalQueryResolvers').greeting, '__relay_model_instance', true),
                  "path": "weak_animal.greeting"
                }
              ],
              "type": "Octopus",
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
                    "name": "PurpleOctopus____relay_model_instance"
                  },
                  "kind": "RelayResolver",
                  "name": "greeting",
                  "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/PurpleOctopus____relay_model_instance.graphql'), require('./../../../relay-runtime/store/__tests__/resolvers/WeakAnimalQueryResolvers').greeting, '__relay_model_instance', true),
                  "path": "weak_animal.greeting"
                }
              ],
              "type": "PurpleOctopus",
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
    "name": "RelayResolverInterfaceTestWeakAnimalGreetingQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "weak_animal",
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": true
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": null,
          "kind": "LinkedField",
          "name": "weak_animal",
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
                  "name": "greeting",
                  "args": null,
                  "fragment": {
                    "kind": "InlineFragment",
                    "selections": (v2/*: any*/),
                    "type": "Octopus",
                    "abstractKey": null
                  },
                  "kind": "RelayResolver",
                  "storageKey": null,
                  "isOutputType": true
                }
              ],
              "type": "Octopus",
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
                    "selections": (v2/*: any*/),
                    "type": "PurpleOctopus",
                    "abstractKey": null
                  },
                  "kind": "RelayResolver",
                  "storageKey": null,
                  "isOutputType": true
                }
              ],
              "type": "PurpleOctopus",
              "abstractKey": null
            }
          ],
          "storageKey": null
        }
      }
    ]
  },
  "params": {
    "cacheID": "5394312c92d4f62346e896c932509875",
    "id": null,
    "metadata": {},
    "name": "RelayResolverInterfaceTestWeakAnimalGreetingQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f871e0ce246bae6f8a3048e352bf8bd2";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverInterfaceTestWeakAnimalGreetingQuery$variables,
  RelayResolverInterfaceTestWeakAnimalGreetingQuery$data,
>*/);
