/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<cf6b42db441d5f3508cc81fb0a3786e4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
export type RelayReaderCatchFieldsTest01Query$variables = {||};
export type RelayReaderCatchFieldsTest01Query$data = {|
  +me: ?{|
    +lastName: Result<?string, unknown>,
  |},
|};
export type RelayReaderCatchFieldsTest01Query = {|
  response: RelayReaderCatchFieldsTest01Query$data,
  variables: RelayReaderCatchFieldsTest01Query$variables,
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
    "name": "RelayReaderCatchFieldsTest01Query",
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
            "to": "RESULT"
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
    "name": "RelayReaderCatchFieldsTest01Query",
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
    "cacheID": "55c7a2cc329fc27c95f2a38883b164ad",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTest01Query",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTest01Query {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "646698bb7a5940aef37200d506279311";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTest01Query$variables,
  RelayReaderCatchFieldsTest01Query$data,
>*/);
