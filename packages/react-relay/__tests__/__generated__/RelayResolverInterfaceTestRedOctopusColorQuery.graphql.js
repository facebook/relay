/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f7b15df9b150c2facfc8f391b2c2bce5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { RelayResolverInterfaceTestWeakAnimalColorFragment$fragmentType } from "./RelayResolverInterfaceTestWeakAnimalColorFragment.graphql";
import {red_octopus as queryRedOctopusResolverType} from "../../../relay-runtime/store/__tests__/resolvers/RedOctopusResolvers.js";
// Type assertion validating that `queryRedOctopusResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryRedOctopusResolverType: () => ?RedOctopus);
import type { RedOctopus } from "../../../relay-runtime/store/__tests__/resolvers/RedOctopusResolvers.js";
export type RelayResolverInterfaceTestRedOctopusColorQuery$variables = {||};
export type RelayResolverInterfaceTestRedOctopusColorQuery$data = {|
  +red_octopus: ?{|
    +$fragmentSpreads: RelayResolverInterfaceTestWeakAnimalColorFragment$fragmentType,
  |},
|};
export type RelayResolverInterfaceTestRedOctopusColorQuery = {|
  response: RelayResolverInterfaceTestRedOctopusColorQuery$data,
  variables: RelayResolverInterfaceTestRedOctopusColorQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolverInterfaceTestRedOctopusColorQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "RedOctopus",
        "modelResolvers": null,
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "red_octopus",
          "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/RedOctopusResolvers').red_octopus,
          "path": "red_octopus",
          "normalizationInfo": {
            "kind": "WeakModel",
            "concreteType": "RedOctopus",
            "plural": false
          }
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "RedOctopus",
          "kind": "LinkedField",
          "name": "red_octopus",
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayResolverInterfaceTestRedOctopusColorQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "red_octopus",
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": true
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "RedOctopus",
          "kind": "LinkedField",
          "name": "red_octopus",
          "plural": false,
          "selections": [
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "kind": "InlineFragment",
                  "selections": [
                    {
                      "name": "color",
                      "args": null,
                      "fragment": {
                        "kind": "InlineFragment",
                        "selections": (v0/*: any*/),
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
                        "selections": (v0/*: any*/),
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
              "type": "IWeakAnimal",
              "abstractKey": "__isIWeakAnimal"
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
    "cacheID": "fe03faa56132552c947fd62dd0e8ce24",
    "id": null,
    "metadata": {},
    "name": "RelayResolverInterfaceTestRedOctopusColorQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ffbde5e537add11a8fa22b95fcd6c23c";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverInterfaceTestRedOctopusColorQuery$variables,
  RelayResolverInterfaceTestRedOctopusColorQuery$data,
>*/);
