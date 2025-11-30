/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e038c21c5f8a3810f455c2ca85c878d8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
export type RelayReaderCatchFieldsTest02Query$variables = {||};
export type RelayReaderCatchFieldsTest02Query$data = {|
  +me: Result<?{|
    +lastName: string,
  |}, unknown>,
|};
export type RelayReaderCatchFieldsTest02Query = {|
  response: RelayReaderCatchFieldsTest02Query$data,
  variables: RelayReaderCatchFieldsTest02Query$variables,
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
    "name": "RelayReaderCatchFieldsTest02Query",
    "selections": [
      {
        "kind": "CatchField",
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
              "action": "THROW"
            }
          ],
          "storageKey": null
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderCatchFieldsTest02Query",
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
    "cacheID": "34e1af5d2d4ea68ba0882c4841c9c623",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTest02Query",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTest02Query {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d8f6e5100562fac101a44e03c6403848";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTest02Query$variables,
  RelayReaderCatchFieldsTest02Query$data,
>*/);
