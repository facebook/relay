/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderCatchFieldsTest1Query$variables = {||};
export type RelayReaderCatchFieldsTest1Query$data = {|
  +me: {|
    +lastName: string,
  |},
|};
export type RelayReaderCatchFieldsTest1Query = {|
  response: RelayReaderCatchFieldsTest1Query$data,
  variables: RelayReaderCatchFieldsTest1Query$variables,
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
    "name": "RelayReaderCatchFieldsTest1Query",
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
              "kind": "CatchField",
              "field": (v0/*: any*/),
              "to": "RESULT",
              "path": "me.lastName"
            }
          ],
          "storageKey": null,
        },
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderCatchFieldsTest1Query",
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
    "cacheID": "8cd69a31b3db9176dc76e43d3a795c6f",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTest1Query",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTest1Query {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "87b6ffdc922687a788965139fef7a707";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTest1Query$variables,
  RelayReaderCatchFieldsTest1Query$data,
>*/);
