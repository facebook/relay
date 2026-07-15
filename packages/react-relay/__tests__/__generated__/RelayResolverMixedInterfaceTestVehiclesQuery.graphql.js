/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<260f03fca521ba3f900ca1d83279b56d>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { RelayResolverMixedInterfaceTestWheelsFragment$fragmentType } from "./RelayResolverMixedInterfaceTestWheelsFragment.graphql";
import {vehicles as queryVehiclesResolverType} from "../RelayResolverMixedInterface-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryVehiclesResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryVehiclesResolverType as (
  args: void,
  context: TestResolverContextType,
) => ?ReadonlyArray<?{
  readonly __typename: "Bicycle" | "Car",
  readonly id: DataID,
}>);
export type RelayResolverMixedInterfaceTestVehiclesQuery$variables = {};
export type RelayResolverMixedInterfaceTestVehiclesQuery$data = {
  readonly vehicles: ?ReadonlyArray<?{
    readonly $fragmentSpreads: RelayResolverMixedInterfaceTestWheelsFragment$fragmentType,
  }>,
};
export type RelayResolverMixedInterfaceTestVehiclesQuery = {
  response: RelayResolverMixedInterfaceTestVehiclesQuery$data,
  variables: RelayResolverMixedInterfaceTestVehiclesQuery$variables,
};
*/

var node/*: ClientRequest*/ = (function(){
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
    "name": "RelayResolverMixedInterfaceTestVehiclesQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": null,
        "modelResolvers": {
          "Car": {
            "alias": null,
            "args": null,
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "Car__id"
            },
            "kind": "RelayResolver",
            "name": "__relay_model_instance",
            "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./Car__id.graphql'), require('../RelayResolverMixedInterface-test').Car, 'id', true),
            "path": "vehicles.__relay_model_instance"
          }
        },
        "serverObjectOperations": {
          "Bicycle": require('./ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles.graphql')
        },
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "vehicles",
          "resolverModule": require('../RelayResolverMixedInterface-test').vehicles,
          "path": "vehicles"
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "vehicles",
          "plural": true,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "RelayResolverMixedInterfaceTestWheelsFragment"
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
    "name": "RelayResolverMixedInterfaceTestVehiclesQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "vehicles",
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": false
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "vehicles",
          "plural": true,
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
                  "name": "wheels",
                  "storageKey": null
                }
              ],
              "type": "Bicycle",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "name": "wheels",
                  "args": null,
                  "fragment": {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "name": "__relay_model_instance",
                        "args": null,
                        "fragment": {
                          "kind": "InlineFragment",
                          "selections": [
                            (v0/*:: as any*/)
                          ],
                          "type": "Car",
                          "abstractKey": null
                        },
                        "kind": "RelayResolver",
                        "storageKey": null,
                        "isOutputType": false
                      }
                    ],
                    "type": "Car",
                    "abstractKey": null
                  },
                  "kind": "RelayResolver",
                  "storageKey": null,
                  "isOutputType": true
                }
              ],
              "type": "Car",
              "abstractKey": null
            },
            (v0/*:: as any*/)
          ],
          "storageKey": null
        }
      }
    ],
    "clientAbstractTypes": {
      "__isIVehicle": [
        "Bicycle",
        "Car"
      ]
    }
  },
  "params": {
    "cacheID": "2ff0fd1337cd10a22df2ffe42de86bf0",
    "id": null,
    "metadata": {},
    "name": "RelayResolverMixedInterfaceTestVehiclesQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "d06dbd2f8539613d8ea5d82cf89ae318";
}

module.exports = ((node/*:: as any*/)/*:: as ClientQuery<
  RelayResolverMixedInterfaceTestVehiclesQuery$variables,
  RelayResolverMixedInterfaceTestVehiclesQuery$data,
>*/);
