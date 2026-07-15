/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<df688843fc9f700013b5bad2c3d4dcd0>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { RelayModernEnvironmentTypeRefinementTestClientInterface$fragmentType } from "./RelayModernEnvironmentTypeRefinementTestClientInterface.graphql";
export type RelayModernEnvironmentTypeRefinementTestClientAbstractQuery$variables = {};
export type RelayModernEnvironmentTypeRefinementTestClientAbstractQuery$data = {
  readonly client_interface: ?{
    readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTestClientInterface$fragmentType,
  },
};
export type RelayModernEnvironmentTypeRefinementTestClientAbstractQuery = {
  response: RelayModernEnvironmentTypeRefinementTestClientAbstractQuery$data,
  variables: RelayModernEnvironmentTypeRefinementTestClientAbstractQuery$variables,
};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
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
    "name": "RelayModernEnvironmentTypeRefinementTestClientAbstractQuery",
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
                "name": "RelayModernEnvironmentTypeRefinementTestClientInterface"
              }
            ],
            "storageKey": null
          }
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
    "name": "RelayModernEnvironmentTypeRefinementTestClientAbstractQuery",
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
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v0/*:: as any*/),
                "type": "ClientTypeImplementingClientInterface",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v0/*:: as any*/),
                "type": "OtherClientTypeImplementingClientInterface",
                "abstractKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "clientAbstractTypes": {
      "__isClientInterface": [
        "ClientTypeImplementingClientInterface",
        "OtherClientTypeImplementingClientInterface"
      ]
    }
  },
  "params": {
    "cacheID": "ad9adf6c7d765caca998d65e7cd8ec41",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentTypeRefinementTestClientAbstractQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "f6eba7c5be21b5bc892e69ffa6f017d6";
}

module.exports = ((node/*:: as any*/)/*:: as ClientQuery<
  RelayModernEnvironmentTypeRefinementTestClientAbstractQuery$variables,
  RelayModernEnvironmentTypeRefinementTestClientAbstractQuery$data,
>*/);
