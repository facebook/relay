/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<27aa22be7e8dc8f352ced6a493c65eb6>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { RelayResolverMixedInterfaceTestWheelsFragment$fragmentType } from "./RelayResolverMixedInterfaceTestWheelsFragment.graphql";
import {vehicle as queryVehicleResolverType} from "../RelayResolverMixedInterface-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryVehicleResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryVehicleResolverType as (
  args: {
    isCar: boolean,
  },
  context: TestResolverContextType,
) => ?{
  readonly __typename: "Bicycle" | "Car",
  readonly id: DataID,
});
export type RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery$variables = {
  isCar: boolean,
};
export type RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery$data = {
  readonly vehicle: ?{
    readonly $fragmentSpreads: RelayResolverMixedInterfaceTestWheelsFragment$fragmentType,
  },
};
export type RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery = {
  response: RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery$data,
  variables: RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery$variables,
};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "isCar"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "isCar",
    "variableName": "isCar"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery",
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
            "path": "vehicle.__relay_model_instance"
          }
        },
        "serverObjectOperations": {
          "Bicycle": require('./ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery_vehicle.graphql')
        },
        "backingField": {
          "alias": null,
          "args": (v1/*:: as any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "name": "vehicle",
          "resolverModule": require('../RelayResolverMixedInterface-test').vehicle,
          "path": "vehicle"
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*:: as any*/),
          "concreteType": null,
          "kind": "LinkedField",
          "name": "vehicle",
          "plural": false,
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "vehicle",
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
          "name": "vehicle",
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
                            (v2/*:: as any*/)
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
            (v2/*:: as any*/)
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
    "cacheID": "265bf1cc2320a5c5d1aa4d62819ed2a1",
    "id": null,
    "metadata": {},
    "name": "RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "7f1d34def3f8791d59fcb580942d28e7";
}

module.exports = ((node/*:: as any*/)/*:: as ClientQuery<
  RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery$variables,
  RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery$data,
>*/);
