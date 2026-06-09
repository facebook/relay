/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0099d701a29f90d6160aa993e02f52a0>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$fragmentType } from "./RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles.graphql";
export type ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$variables = {
  id: string,
};
export type ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$data = {
  readonly node: ?{
    readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$fragmentType,
  },
};
export type ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles = {
  response: ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$data,
  variables: ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$variables,
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
    "name": "ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles",
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
            "name": "RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles"
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
    "name": "ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles",
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
    "cacheID": "12ec4c223faa61b4b1e732883e8157a4",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles on Bicycle {\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "d06dbd2f8539613d8ea5d82cf89ae318";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$variables,
  ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$data,
>*/);
