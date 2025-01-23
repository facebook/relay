/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4dbe36bd3bfee2127bd7d703a7de593c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRequiredFieldsTest4Query$variables = {||};
export type RelayReaderRequiredFieldsTest4Query$data = {|
  +me: ?{|
    +firstName: string,
    +lastName: string,
  |},
|};
export type RelayReaderRequiredFieldsTest4Query = {|
  response: RelayReaderRequiredFieldsTest4Query$data,
  variables: RelayReaderRequiredFieldsTest4Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastName",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "firstName",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRequiredFieldsTest4Query",
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
            "kind": "RequiredField",
            "field": (v0/*: any*/),
            "action": "LOG"
          },
          {
            "kind": "RequiredField",
            "field": (v1/*: any*/),
            "action": "LOG"
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
    "name": "RelayReaderRequiredFieldsTest4Query",
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
          (v1/*: any*/),
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
    "cacheID": "60d6981d1a997cd2b32b627df35d2637",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest4Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest4Query {\n  me {\n    lastName\n    firstName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fa8d3866877354b875fa7d375217dfb9";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest4Query$variables,
  RelayReaderRequiredFieldsTest4Query$data,
>*/);
