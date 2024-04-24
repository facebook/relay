/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<81d5b53384bb675978d92e9829597952>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { RelayResolverInterfaceTestWeakAnimalLegsFragment$fragmentType } from "./RelayResolverInterfaceTestWeakAnimalLegsFragment.graphql";
import {octopus as queryOctopusResolverType} from "../../../relay-runtime/store/__tests__/resolvers/OctopusResolvers.js";
// Type assertion validating that `queryOctopusResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryOctopusResolverType: () => ?Octopus);
import type { Octopus } from "../../../relay-runtime/store/__tests__/resolvers/OctopusResolvers.js";
export type RelayResolverInterfaceTestOctopusLegsQuery$variables = {||};
export type RelayResolverInterfaceTestOctopusLegsQuery$data = {|
  +octopus: ?{|
    +$fragmentSpreads: RelayResolverInterfaceTestWeakAnimalLegsFragment$fragmentType,
  |},
|};
export type RelayResolverInterfaceTestOctopusLegsQuery = {|
  response: RelayResolverInterfaceTestOctopusLegsQuery$data,
  variables: RelayResolverInterfaceTestOctopusLegsQuery$variables,
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
    "name": "RelayResolverInterfaceTestOctopusLegsQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "Octopus",
        "modelResolvers": null,
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "octopus",
          "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/OctopusResolvers').octopus,
          "path": "octopus",
          "normalizationInfo": {
            "kind": "WeakModel",
            "concreteType": "Octopus",
            "plural": false
          }
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "Octopus",
          "kind": "LinkedField",
          "name": "octopus",
          "plural": false,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "RelayResolverInterfaceTestWeakAnimalLegsFragment"
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
    "name": "RelayResolverInterfaceTestOctopusLegsQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "octopus",
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": true
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "Octopus",
          "kind": "LinkedField",
          "name": "octopus",
          "plural": false,
          "selections": [
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "kind": "InlineFragment",
                  "selections": [
                    {
                      "name": "legs",
                      "args": null,
                      "fragment": {
                        "kind": "InlineFragment",
                        "selections": (v0/*: any*/),
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
                      "name": "legs",
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
        "Octopus",
        "PurpleOctopus"
      ]
    }
  },
  "params": {
    "cacheID": "edc7acd1daffc1c9c2abbdc16bb0ba00",
    "id": null,
    "metadata": {},
    "name": "RelayResolverInterfaceTestOctopusLegsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a5c917bd6d8d0ac2656557c77209abde";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverInterfaceTestOctopusLegsQuery$variables,
  RelayResolverInterfaceTestOctopusLegsQuery$data,
>*/);
