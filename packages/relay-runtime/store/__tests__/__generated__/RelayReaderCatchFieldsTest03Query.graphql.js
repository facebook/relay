/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f3294283b54fb6332355fd84f5db95f2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderCatchFieldsTest03Query$variables = {||};
export type RelayReaderCatchFieldsTest03Query$data = {|
  +me: ?{|
    +lastName: ?string,
  |},
|};
export type RelayReaderCatchFieldsTest03Query = {|
  response: RelayReaderCatchFieldsTest03Query$data,
  variables: RelayReaderCatchFieldsTest03Query$variables,
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
    "name": "RelayReaderCatchFieldsTest03Query",
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
            "to": "NULL",
            "path": "me.lastName"
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
    "name": "RelayReaderCatchFieldsTest03Query",
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
    "cacheID": "d9494284e42f21f17cb01fb0a018c2d1",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTest03Query",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTest03Query {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2167405240af01df5787f74956f42c00";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTest03Query$variables,
  RelayReaderCatchFieldsTest03Query$data,
>*/);
