/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<be18f0434478ccf22a61fd16d669591c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataCheckerTestClientInterface$fragmentType } from "./DataCheckerTestClientInterface.graphql";
export type DataCheckerTestClientAbstractQuery$variables = {||};
export type DataCheckerTestClientAbstractQuery$data = {|
  +client_interface: ?{|
    +$fragmentSpreads: DataCheckerTestClientInterface$fragmentType,
  |},
|};
export type DataCheckerTestClientAbstractQuery = {|
  response: DataCheckerTestClientAbstractQuery$data,
  variables: DataCheckerTestClientAbstractQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
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
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "description",
                "storageKey": null
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

if (__DEV__) {
  (node/*: any*/).hash = "621e19afb09991109622110ee40f5f61";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  DataCheckerTestClientAbstractQuery$variables,
  DataCheckerTestClientAbstractQuery$data,
>*/);
