/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<59fb6ed11a9d5e3e27a0a86668549c66>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ShadowWeakDuoResolver_RootFragment$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/ShadowWeakDuoResolver_RootFragment.graphql";
import {shadow_weak_duo as queryShadowWeakDuoResolverType} from "../../../relay-runtime/store/__tests__/resolvers/ShadowWeakDuoResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryShadowWeakDuoResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryShadowWeakDuoResolverType as (
  rootKey: ShadowWeakDuoResolver_RootFragment$key,
  args: {
    pick_beta: ?boolean,
  },
  context: TestResolverContextType,
) => ?Query__shadow_weak_duo$normalization);
import type { Query__shadow_weak_duo$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__shadow_weak_duo$normalization.graphql";
export type RelayResolverShadowWeakInterfaceTestAlphaQuery$variables = {};
export type RelayResolverShadowWeakInterfaceTestAlphaQuery$data = {
  readonly shadow_weak_duo: ?{
    readonly label: ?string,
  },
};
export type RelayResolverShadowWeakInterfaceTestAlphaQuery = {
  response: RelayResolverShadowWeakInterfaceTestAlphaQuery$data,
  variables: RelayResolverShadowWeakInterfaceTestAlphaQuery$variables,
};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "pick_beta",
    "value": false
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "me",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "StreetAddress",
      "kind": "LinkedField",
      "name": "address",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "city",
          "storageKey": null
        },
        (v1/*:: as any*/),
        {
          "kind": "ClientExtension",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "__id",
              "storageKey": null
            }
          ]
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v3 = [
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
    "name": "RelayResolverShadowWeakInterfaceTestAlphaQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": null,
        "modelResolvers": {},
        "serverObjectOperations": null,
        "backingField": {
          "alias": null,
          "args": (v0/*:: as any*/),
          "fragment": {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ShadowWeakDuoResolver_RootFragment"
          },
          "kind": "RelayResolver",
          "name": "shadow_weak_duo",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/ShadowWeakDuoResolver').shadow_weak_duo,
          "path": "shadow_weak_duo",
          "normalizationInfo": {
            "kind": "AbstractInline",
            "concreteType": null,
            "plural": false,
            "inlineKinds": {
              "ShadowWeakAlpha": "WeakModel",
              "ShadowWeakBeta": "WeakModel"
            }
          }
        },
        "linkedField": {
          "alias": null,
          "args": (v0/*:: as any*/),
          "concreteType": null,
          "kind": "LinkedField",
          "name": "shadow_weak_duo",
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
                    "name": "ShadowWeakAlpha____relay_model_instance"
                  },
                  "kind": "RelayResolver",
                  "name": "label",
                  "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/ShadowWeakAlpha____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/ShadowWeakAlphaResolvers').label, '__relay_model_instance', true),
                  "path": "shadow_weak_duo.label"
                }
              ],
              "type": "ShadowWeakAlpha",
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
                    "name": "ShadowWeakBeta____relay_model_instance"
                  },
                  "kind": "RelayResolver",
                  "name": "label",
                  "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/ShadowWeakBeta____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/ShadowWeakBetaResolvers').label, '__relay_model_instance', true),
                  "path": "shadow_weak_duo.label"
                }
              ],
              "type": "ShadowWeakBeta",
              "abstractKey": null
            }
          ],
          "storageKey": "shadow_weak_duo(pick_beta:false)"
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
    "name": "RelayResolverShadowWeakInterfaceTestAlphaQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "shadow_weak_duo",
          "args": (v0/*:: as any*/),
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              (v2/*:: as any*/)
            ],
            "type": "Query",
            "abstractKey": null
          },
          "kind": "RelayResolver",
          "storageKey": "shadow_weak_duo(pick_beta:false)",
          "isOutputType": true
        },
        "linkedField": {
          "alias": null,
          "args": (v0/*:: as any*/),
          "concreteType": null,
          "kind": "LinkedField",
          "name": "shadow_weak_duo",
          "plural": false,
          "selections": [
            (v1/*:: as any*/),
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "name": "label",
                  "args": null,
                  "fragment": {
                    "kind": "InlineFragment",
                    "selections": (v3/*:: as any*/),
                    "type": "ShadowWeakAlpha",
                    "abstractKey": null
                  },
                  "kind": "RelayResolver",
                  "storageKey": null,
                  "isOutputType": true
                }
              ],
              "type": "ShadowWeakAlpha",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "name": "label",
                  "args": null,
                  "fragment": {
                    "kind": "InlineFragment",
                    "selections": (v3/*:: as any*/),
                    "type": "ShadowWeakBeta",
                    "abstractKey": null
                  },
                  "kind": "RelayResolver",
                  "storageKey": null,
                  "isOutputType": true
                }
              ],
              "type": "ShadowWeakBeta",
              "abstractKey": null
            }
          ],
          "storageKey": "shadow_weak_duo(pick_beta:false)"
        }
      },
      (v2/*:: as any*/)
    ]
  },
  "params": {
    "cacheID": "d9bc322b150782e297e5e2f8b282e13f",
    "id": null,
    "metadata": {},
    "name": "RelayResolverShadowWeakInterfaceTestAlphaQuery",
    "operationKind": "query",
    "text": "query RelayResolverShadowWeakInterfaceTestAlphaQuery {\n  ...ShadowWeakDuoResolver_RootFragment\n  me {\n    address {\n      city\n      __typename\n    }\n    id\n  }\n}\n\nfragment ShadowWeakDuoResolver_RootFragment on Query {\n  me {\n    address {\n      city\n      __typename\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "30077ab9bab62c68c813b705705ea3fd";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayResolverShadowWeakInterfaceTestAlphaQuery$variables,
  RelayResolverShadowWeakInterfaceTestAlphaQuery$data,
>*/);
