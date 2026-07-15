/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0bbfc6983b39a886b7fd05991b2af205>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { ShadowMagicThingResolver_RootFragment$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/ShadowMagicThingResolver_RootFragment.graphql";
import type { ShadowMagicWeakCity____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/ShadowMagicWeakCity____relay_model_instance.graphql";
import {shadow_magic_thing as queryShadowMagicThingResolverType} from "../../../relay-runtime/store/__tests__/resolvers/ShadowMagicThingResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryShadowMagicThingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryShadowMagicThingResolverType as (
  rootKey: ShadowMagicThingResolver_RootFragment$key,
  args: {
    force_weak: ?boolean,
  },
  context: TestResolverContextType,
) => ?({
  readonly __typename: "ShadowMagicWeakCity",
  readonly __relay_model_instance: ShadowMagicWeakCity____relay_model_instance$data['__relay_model_instance'],
} | {
  readonly __typename: "StreetAddress",
  readonly __id: DataID,
}));
export type RelayResolverShadowMagicFragmentTestValueQuery$variables = {};
export type RelayResolverShadowMagicFragmentTestValueQuery$data = {
  readonly shadow_magic_thing: ?{
    readonly city: ?string,
  },
};
export type RelayResolverShadowMagicFragmentTestValueQuery = {
  response: RelayResolverShadowMagicFragmentTestValueQuery$data,
  variables: RelayResolverShadowMagicFragmentTestValueQuery$variables,
};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "force_weak",
    "value": false
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "city",
  "storageKey": null
},
v2 = {
  "kind": "InlineFragment",
  "selections": [
    (v1/*:: as any*/)
  ],
  "type": "StreetAddress",
  "abstractKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
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
        (v1/*:: as any*/),
        (v3/*:: as any*/),
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
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolverShadowMagicFragmentTestValueQuery",
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
            "name": "ShadowMagicThingResolver_RootFragment"
          },
          "kind": "RelayResolver",
          "name": "shadow_magic_thing",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/ShadowMagicThingResolver').shadow_magic_thing,
          "path": "shadow_magic_thing",
          "normalizationInfo": {
            "kind": "AbstractInline",
            "concreteType": null,
            "plural": false,
            "inlineKinds": {
              "ShadowMagicWeakCity": "WeakModel",
              "StreetAddress": "ServerWeak"
            }
          }
        },
        "linkedField": {
          "alias": null,
          "args": (v0/*:: as any*/),
          "concreteType": null,
          "kind": "LinkedField",
          "name": "shadow_magic_thing",
          "plural": false,
          "selections": [
            (v2/*:: as any*/),
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "fragment": {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ShadowMagicWeakCity____relay_model_instance"
                  },
                  "kind": "RelayResolver",
                  "name": "city",
                  "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/ShadowMagicWeakCity____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/ShadowMagicWeakCityResolvers').city, '__relay_model_instance', true),
                  "path": "shadow_magic_thing.city"
                }
              ],
              "type": "ShadowMagicWeakCity",
              "abstractKey": null
            }
          ],
          "storageKey": "shadow_magic_thing(force_weak:false)"
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
    "name": "RelayResolverShadowMagicFragmentTestValueQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "shadow_magic_thing",
          "args": (v0/*:: as any*/),
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              (v4/*:: as any*/)
            ],
            "type": "Query",
            "abstractKey": null
          },
          "kind": "RelayResolver",
          "storageKey": "shadow_magic_thing(force_weak:false)",
          "isOutputType": true
        },
        "linkedField": {
          "alias": null,
          "args": (v0/*:: as any*/),
          "concreteType": null,
          "kind": "LinkedField",
          "name": "shadow_magic_thing",
          "plural": false,
          "selections": [
            (v3/*:: as any*/),
            (v2/*:: as any*/),
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "name": "city",
                  "args": null,
                  "fragment": {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__relay_model_instance",
                        "storageKey": null
                      }
                    ],
                    "type": "ShadowMagicWeakCity",
                    "abstractKey": null
                  },
                  "kind": "RelayResolver",
                  "storageKey": null,
                  "isOutputType": true
                }
              ],
              "type": "ShadowMagicWeakCity",
              "abstractKey": null
            }
          ],
          "storageKey": "shadow_magic_thing(force_weak:false)"
        }
      },
      (v4/*:: as any*/)
    ]
  },
  "params": {
    "cacheID": "4cb7d353df1f391edb2240e101871422",
    "id": null,
    "metadata": {},
    "name": "RelayResolverShadowMagicFragmentTestValueQuery",
    "operationKind": "query",
    "text": "query RelayResolverShadowMagicFragmentTestValueQuery {\n  ...ShadowMagicThingResolver_RootFragment\n  me {\n    address {\n      city\n      __typename\n    }\n    id\n  }\n}\n\nfragment ShadowMagicThingResolver_RootFragment on Query {\n  me {\n    address {\n      city\n      __typename\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "a9ebbcbc9634221ec07acb6363344351";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayResolverShadowMagicFragmentTestValueQuery$variables,
  RelayResolverShadowMagicFragmentTestValueQuery$data,
>*/);
