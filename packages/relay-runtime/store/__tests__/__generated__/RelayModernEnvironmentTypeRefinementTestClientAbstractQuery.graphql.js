/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<19a4d8e4249e58f7ad3fe3ebe59f904a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTestClientInterface$fragmentType = any;
export type RelayModernEnvironmentTypeRefinementTestClientAbstractQuery$variables = {||};
export type RelayModernEnvironmentTypeRefinementTestClientAbstractQuery$data = {|
  +client_interface: ?{|
    +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTestClientInterface$fragmentType,
  |},
|};
export type RelayModernEnvironmentTypeRefinementTestClientAbstractQuery = {|
  response: RelayModernEnvironmentTypeRefinementTestClientAbstractQuery$data,
  variables: RelayModernEnvironmentTypeRefinementTestClientAbstractQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
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
    "cacheID": "ad9adf6c7d765caca998d65e7cd8ec41",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentTypeRefinementTestClientAbstractQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "f6eba7c5be21b5bc892e69ffa6f017d6";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayModernEnvironmentTypeRefinementTestClientAbstractQuery$variables,
  RelayModernEnvironmentTypeRefinementTestClientAbstractQuery$data,
>*/);
