/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c62068a2f1bce04dac16f723c0d6ff94>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { RelayResolverInterfaceTestWeakAnimalColorFragment$fragmentType } from "./RelayResolverInterfaceTestWeakAnimalColorFragment.graphql";
import {weak_animal as queryWeakAnimalResolverType} from "../../../relay-runtime/store/__tests__/resolvers/WeakAnimalQueryResolvers.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryWeakAnimalResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryWeakAnimalResolverType: (
  args: {|
    request: WeakAnimalRequest,
  |},
  context: TestResolverContextType,
) => ?Query__weak_animal$normalization);
import type { Query__weak_animal$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__weak_animal$normalization.graphql";
export type WeakAnimalRequest = {|
  ofType: string,
|};
export type RelayResolverInterfaceTestWeakAnimalColorQuery$variables = {|
  request: WeakAnimalRequest,
|};
export type RelayResolverInterfaceTestWeakAnimalColorQuery$data = {|
  +weak_animal: ?{|
    +$fragmentSpreads: RelayResolverInterfaceTestWeakAnimalColorFragment$fragmentType,
  |},
|};
export type RelayResolverInterfaceTestWeakAnimalColorQuery = {|
  response: RelayResolverInterfaceTestWeakAnimalColorQuery$data,
  variables: RelayResolverInterfaceTestWeakAnimalColorQuery$variables,
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
    "name": "RelayResolverInterfaceTestWeakAnimalColorQuery",
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
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/WeakAnimalQueryResolvers').weak_animal,
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
              "args": null,
              "kind": "FragmentSpread",
              "name": "RelayResolverInterfaceTestWeakAnimalColorFragment"
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
    "name": "RelayResolverInterfaceTestWeakAnimalColorQuery",
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
                  "name": "color",
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
            },
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "name": "color",
                  "args": null,
                  "fragment": {
                    "kind": "InlineFragment",
                    "selections": (v2/*: any*/),
                    "type": "RedOctopus",
                    "abstractKey": null
                  },
                  "kind": "RelayResolver",
                  "storageKey": null,
                  "isOutputType": true
                }
              ],
              "type": "RedOctopus",
              "abstractKey": null
            }
          ],
          "storageKey": null
        }
      }
    ],
    "clientAbstractTypes": {
      "__isIWeakAnimal": [
        "PurpleOctopus",
        "RedOctopus"
      ]
    }
  },
  "params": {
    "cacheID": "fc56803374dcf9a2294d2787a7390568",
    "id": null,
    "metadata": {},
    "name": "RelayResolverInterfaceTestWeakAnimalColorQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b042ac45639bb10096cef34450b19b77";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverInterfaceTestWeakAnimalColorQuery$variables,
  RelayResolverInterfaceTestWeakAnimalColorQuery$data,
>*/);
