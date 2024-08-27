/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<af8dbfa062e4dbd0e8a422e347160b0a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
export type RelayReaderCatchFieldsTest06Query$variables = {||};
export type RelayReaderCatchFieldsTest06Query$data = {|
  +me: Result<?{|
    +lastName: string,
  |}, $ReadOnlyArray<mixed>>,
|};
export type RelayReaderCatchFieldsTest06Query = {|
  response: RelayReaderCatchFieldsTest06Query$data,
  variables: RelayReaderCatchFieldsTest06Query$variables,
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
    "name": "RelayReaderCatchFieldsTest06Query",
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
              "action": "THROW",
              "path": "me.lastName"
            }
          ],
          "storageKey": null
        },
        "to": "RESULT",
        "path": "me"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderCatchFieldsTest06Query",
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
    "cacheID": "d5a4c5e523e30fe68c8214734d99c140",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTest06Query",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTest06Query {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "35e3a660fefc768f2b7dc37153781e09";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTest06Query$variables,
  RelayReaderCatchFieldsTest06Query$data,
>*/);
