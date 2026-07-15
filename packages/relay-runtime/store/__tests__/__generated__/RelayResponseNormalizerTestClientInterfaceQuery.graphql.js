/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e4711cb2087a7ed704fe8ee60e7d7e7b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { RelayResponseNormalizerTestClientInterfaceFragment$fragmentType } from "./RelayResponseNormalizerTestClientInterfaceFragment.graphql";
export type RelayResponseNormalizerTestClientInterfaceQuery$variables = {};
export type RelayResponseNormalizerTestClientInterfaceQuery$data = {
  readonly client_interface: ?{
    readonly $fragmentSpreads: RelayResponseNormalizerTestClientInterfaceFragment$fragmentType,
  },
  readonly client_union: ?{
    readonly __typename: string,
  },
};
export type RelayResponseNormalizerTestClientInterfaceQuery = {
  response: RelayResponseNormalizerTestClientInterfaceQuery$data,
  variables: RelayResponseNormalizerTestClientInterfaceQuery$variables,
};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "client_union",
  "plural": false,
  "selections": [
    (v0/*:: as any*/)
  ],
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "description",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTestClientInterfaceQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "client_interface",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayResponseNormalizerTestClientInterfaceFragment"
              }
            ],
            "storageKey": null
          },
          (v1/*:: as any*/)
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayResponseNormalizerTestClientInterfaceQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "client_interface",
            "plural": false,
            "selections": [
              (v0/*:: as any*/),
              {
                "kind": "InlineFragment",
                "selections": (v2/*:: as any*/),
                "type": "ClientTypeImplementingClientInterface",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v2/*:: as any*/),
                "type": "OtherClientTypeImplementingClientInterface",
                "abstractKey": null
              }
            ],
            "storageKey": null
          },
          (v1/*:: as any*/)
        ]
      }
    ],
    "clientAbstractTypes": {
      "__isClientInterface": [
        "ClientTypeImplementingClientInterface",
        "OtherClientTypeImplementingClientInterface"
      ],
      "__isClientUnion": [
        "ClientTypeInUnion",
        "OtherClientTypeInUnion"
      ]
    }
  },
  "params": {
    "cacheID": "f032f4115a3c158be2a330847665b868",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTestClientInterfaceQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "fda6737d4bb601d57ab80c634726d8a3";
}

module.exports = ((node/*:: as any*/)/*:: as ClientQuery<
  RelayResponseNormalizerTestClientInterfaceQuery$variables,
  RelayResponseNormalizerTestClientInterfaceQuery$data,
>*/);
