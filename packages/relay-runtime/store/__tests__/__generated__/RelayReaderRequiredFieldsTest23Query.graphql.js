/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<13900dd18641d53d5d484cd4babb6cc0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderRequiredFieldsTest5Fragment$fragmentType } from "./RelayReaderRequiredFieldsTest5Fragment.graphql";
export type RelayReaderRequiredFieldsTest23Query$variables = {||};
export type RelayReaderRequiredFieldsTest23Query$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderRequiredFieldsTest5Fragment$fragmentType,
  |},
|};
export type RelayReaderRequiredFieldsTest23Query = {|
  response: RelayReaderRequiredFieldsTest23Query$data,
  variables: RelayReaderRequiredFieldsTest23Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest23Query",
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
            "name": "RelayReaderRequiredFieldsTest5Fragment"
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
    "name": "RelayReaderRequiredFieldsTest23Query",
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
            "name": "username",
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
      }
    ]
  },
  "params": {
    "cacheID": "66e2d58bc3a4edf360db2a7cb5dec8ce",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest23Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest23Query {\n  me {\n    ...RelayReaderRequiredFieldsTest5Fragment\n    id\n  }\n}\n\nfragment RelayReaderRequiredFieldsTest5Fragment on User {\n  firstName\n  username\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "87cd5c3a576d7d9481983ee2468af663";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest23Query$variables,
  RelayReaderRequiredFieldsTest23Query$data,
>*/);
