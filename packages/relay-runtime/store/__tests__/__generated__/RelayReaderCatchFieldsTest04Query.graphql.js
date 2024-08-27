/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<eac0787fbd129567a43e844c1d76e502>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
export type RelayReaderCatchFieldsTest04Query$variables = {||};
export type RelayReaderCatchFieldsTest04Query$data = {|
  +me: ?{|
    +lastName: Result<?string, $ReadOnlyArray<mixed>>,
  |},
|};
export type RelayReaderCatchFieldsTest04Query = {|
  response: RelayReaderCatchFieldsTest04Query$data,
  variables: RelayReaderCatchFieldsTest04Query$variables,
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
    "name": "RelayReaderCatchFieldsTest04Query",
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
    "name": "RelayReaderCatchFieldsTest04Query",
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
    "cacheID": "ca1f42d5b0fc5c9d7a77f1d081b0f8b5",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTest04Query",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTest04Query {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "38950a90f1b255f6ce6820966ed0d5b7";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTest04Query$variables,
  RelayReaderCatchFieldsTest04Query$data,
>*/);
