/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<73d201b72371446b932757b600563bf4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest7Query$variables = {||};
export type RelayReaderRequiredFieldsTest7Query$data = ?{|
  +me: {|
    +lastName: string,
  |},
|};
export type RelayReaderRequiredFieldsTest7Query = {|
  response: RelayReaderRequiredFieldsTest7Query$data,
  variables: RelayReaderRequiredFieldsTest7Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastName",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest7Query",
    "selections": [
      {
        "kind": "RequiredField",
        "field": {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "me",
          "plural": false,
          "selections": [
            {
              "kind": "RequiredField",
              "field": (v0/*: any*/),
              "action": "LOG"
            }
          ],
          "storageKey": null
        },
        "action": "LOG"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRequiredFieldsTest7Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
    "cacheID": "5467dfbaaf00c8409de83b020971cf24",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest7Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest7Query {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8442a436500c44c56824c995aff1958b";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest7Query$variables,
  RelayReaderRequiredFieldsTest7Query$data,
>*/);
