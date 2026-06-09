/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0b1908d992939140d036132ad5d676e5>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$fragmentType } from "./RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle.graphql";
export type ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$variables = {
  id: string,
};
export type ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$data = {
  readonly node: ?{
    readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$fragmentType,
  },
};
export type ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle = {
  response: ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$data,
  variables: ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$variables,
};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
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
    "metadata": null,
    "name": "ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
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
            "kind": "InlineFragment",
            "selections": [
              {
                "kind": "ClientExtension",
                "selections": [
                  {
                    "kind": "InlineFragment",
                    "selections": [
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
                      }
                    ],
                    "type": "IVehicle",
                    "abstractKey": "__isIVehicle"
                  }
                ]
              }
            ],
            "type": "Bicycle",
            "abstractKey": null
          }
        ],
        "storageKey": null
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
    "cacheID": "ab6888e2d0d1eee301c798260a7c59cd",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle on Bicycle {\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "b398e4b078628d62e66bd9d22f5886e2";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$variables,
  ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$data,
>*/);
