/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<79616f40a588c72286988f0c84046021>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { RelayResolverMixedUnionFetchableTestFragment$fragmentType } from "./RelayResolverMixedUnionFetchableTestFragment.graphql";
import {mixed_vehicle as queryMixedVehicleResolverType} from "../RelayResolverMixedUnionFetchable-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryMixedVehicleResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryMixedVehicleResolverType as (
  args: {
    isHovercraft: boolean,
  },
  context: TestResolverContextType,
) => ?{
  readonly __typename: "Hovercraft" | "NonNodeStory",
  readonly id: DataID,
});
export type RelayResolverMixedUnionFetchableTestNonNodeStoryQuery$variables = {
  isHovercraft: boolean,
};
export type RelayResolverMixedUnionFetchableTestNonNodeStoryQuery$data = {
  readonly mixed_vehicle: ?{
    readonly $fragmentSpreads: RelayResolverMixedUnionFetchableTestFragment$fragmentType,
  },
};
export type RelayResolverMixedUnionFetchableTestNonNodeStoryQuery = {
  response: RelayResolverMixedUnionFetchableTestNonNodeStoryQuery$data,
  variables: RelayResolverMixedUnionFetchableTestNonNodeStoryQuery$variables,
};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "isHovercraft"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "isHovercraft",
    "variableName": "isHovercraft"
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
    "name": "RelayResolverMixedUnionFetchableTestNonNodeStoryQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": null,
        "modelResolvers": {
          "Hovercraft": {
            "alias": null,
            "args": null,
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "Hovercraft__id"
            },
            "kind": "RelayResolver",
            "name": "__relay_model_instance",
            "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./Hovercraft__id.graphql'), require('../RelayResolverMixedUnionFetchable-test').Hovercraft, 'id', true),
            "path": "mixed_vehicle.__relay_model_instance"
          }
        },
        "serverObjectOperations": {
          "NonNodeStory": require('./ClientEdgeQuery_RelayResolverMixedUnionFetchableTestNonNodeStoryQuery_mixed_vehicle.graphql')
        },
        "backingField": {
          "alias": null,
          "args": (v1/*:: as any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "name": "mixed_vehicle",
          "resolverModule": require('../RelayResolverMixedUnionFetchable-test').mixed_vehicle,
          "path": "mixed_vehicle"
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*:: as any*/),
          "concreteType": null,
          "kind": "LinkedField",
          "name": "mixed_vehicle",
          "plural": false,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "RelayResolverMixedUnionFetchableTestFragment"
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
    "name": "RelayResolverMixedUnionFetchableTestNonNodeStoryQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "mixed_vehicle",
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
          "name": "mixed_vehicle",
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
                  "name": "tracking",
                  "storageKey": null
                },
                (v2/*:: as any*/)
              ],
              "type": "NonNodeStory",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "name": "description",
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
                          "type": "Hovercraft",
                          "abstractKey": null
                        },
                        "kind": "RelayResolver",
                        "storageKey": null,
                        "isOutputType": false
                      }
                    ],
                    "type": "Hovercraft",
                    "abstractKey": null
                  },
                  "kind": "RelayResolver",
                  "storageKey": null,
                  "isOutputType": true
                },
                (v2/*:: as any*/)
              ],
              "type": "Hovercraft",
              "abstractKey": null
            }
          ],
          "storageKey": null
        }
      }
    ],
    "clientAbstractTypes": {
      "__isMixedVehicle": [
        "Hovercraft",
        "NonNodeStory"
      ]
    }
  },
  "params": {
    "cacheID": "c800b65a47fb7be70d7ae1218b042abd",
    "id": null,
    "metadata": {},
    "name": "RelayResolverMixedUnionFetchableTestNonNodeStoryQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "570527472dcc16ea924b133ebd10a35d";
}

module.exports = ((node/*:: as any*/)/*:: as ClientQuery<
  RelayResolverMixedUnionFetchableTestNonNodeStoryQuery$variables,
  RelayResolverMixedUnionFetchableTestNonNodeStoryQuery$data,
>*/);
