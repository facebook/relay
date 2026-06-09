/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<776377643f28e8699ff1b432be8c3c95>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayResolverMixedInterfaceTestWheelsFragment$fragmentType } from "./RelayResolverMixedInterfaceTestWheelsFragment.graphql";
export type RelayResolverMixedInterfaceTestBicycleQuery$variables = {};
export type RelayResolverMixedInterfaceTestBicycleQuery$data = {
  readonly bicycle: ?{
    readonly $fragmentSpreads: RelayResolverMixedInterfaceTestWheelsFragment$fragmentType,
  },
};
export type RelayResolverMixedInterfaceTestBicycleQuery = {
  response: RelayResolverMixedInterfaceTestBicycleQuery$data,
  variables: RelayResolverMixedInterfaceTestBicycleQuery$variables,
};
*/

var node/*: ConcreteRequest*/ = (function(){
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
    "metadata": null,
    "name": "RelayResolverMixedInterfaceTestBicycleQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Bicycle",
        "kind": "LinkedField",
        "name": "bicycle",
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayResolverMixedInterfaceTestBicycleQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Bicycle",
        "kind": "LinkedField",
        "name": "bicycle",
        "plural": false,
        "selections": [
          (v0/*:: as any*/),
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
                  }
                ],
                "type": "IVehicle",
                "abstractKey": "__isIVehicle"
              }
            ]
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
    "cacheID": "c3d8f69d2d0299011274d38f6440b8f3",
    "id": null,
    "metadata": {},
    "name": "RelayResolverMixedInterfaceTestBicycleQuery",
    "operationKind": "query",
    "text": "query RelayResolverMixedInterfaceTestBicycleQuery {\n  bicycle {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "e387a24d67b303316be65c07b0b93017";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayResolverMixedInterfaceTestBicycleQuery$variables,
  RelayResolverMixedInterfaceTestBicycleQuery$data,
>*/);
