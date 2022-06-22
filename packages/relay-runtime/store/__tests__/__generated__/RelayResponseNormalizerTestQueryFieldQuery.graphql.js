/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<03f7e769b4dfcfcb86d056ccd05fa127>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTestQueryFieldFragment$fragmentType = any;
export type RelayResponseNormalizerTestQueryFieldQuery$variables = {||};
export type RelayResponseNormalizerTestQueryFieldQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTestQueryFieldFragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTestQueryFieldQuery = {|
  response: RelayResponseNormalizerTestQueryFieldQuery$data,
  variables: RelayResponseNormalizerTestQueryFieldQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTestQueryFieldQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayResponseNormalizerTestQueryFieldFragment"
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
    "name": "RelayResponseNormalizerTestQueryFieldQuery",
    "selections": [
      {
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
            "kind": "ScalarField",
            "name": "firstName",
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
      {
        "alias": null,
        "args": null,
        "concreteType": "Settings",
        "kind": "LinkedField",
        "name": "defaultSettings",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "notificationSounds",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "74abd04d8fae9daa961ae7c19a7dfe1f",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTestQueryFieldQuery",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTestQueryFieldQuery {\n  me {\n    ...RelayResponseNormalizerTestQueryFieldFragment\n    id\n  }\n  defaultSettings {\n    notificationSounds\n  }\n}\n\nfragment RelayResponseNormalizerTestQueryFieldFragment on User {\n  firstName\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "0771594b4d7cb002368d59870f51aaaa";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTestQueryFieldQuery$variables,
  RelayResponseNormalizerTestQueryFieldQuery$data,
>*/);
