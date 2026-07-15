/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b51322e027b2f57fd37984e72c194604>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataCheckerTestClientInterface$fragmentType } from "./DataCheckerTestClientInterface.graphql";
export type DataCheckerTestClientAbstractQuery$variables = {};
export type DataCheckerTestClientAbstractQuery$data = {
  readonly client_interface: ?{
    readonly $fragmentSpreads: DataCheckerTestClientInterface$fragmentType,
  },
};
export type DataCheckerTestClientAbstractQuery = {
  response: DataCheckerTestClientAbstractQuery$data,
  variables: DataCheckerTestClientAbstractQuery$variables,
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
    "name": "DataCheckerTestClientAbstractQuery",
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
                "name": "DataCheckerTestClientInterface"
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
    "name": "DataCheckerTestClientAbstractQuery",
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
    "cacheID": "45e00d09635d463c054740359ede6a9c",
    "id": null,
    "metadata": {},
    "name": "DataCheckerTestClientAbstractQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "621e19afb09991109622110ee40f5f61";
}

module.exports = ((node/*:: as any*/)/*:: as ClientQuery<
  DataCheckerTestClientAbstractQuery$variables,
  DataCheckerTestClientAbstractQuery$data,
>*/);
