/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<cf6f425b65b3b9034d9461c3d8067059>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderCatchFieldsTestRequiredCatchToNullErrorQuery$variables = {||};
export type RelayReaderCatchFieldsTestRequiredCatchToNullErrorQuery$data = {|
  +me: ?{|
    +firstName: string,
  |},
|};
export type RelayReaderCatchFieldsTestRequiredCatchToNullErrorQuery = {|
  response: RelayReaderCatchFieldsTestRequiredCatchToNullErrorQuery$data,
  variables: RelayReaderCatchFieldsTestRequiredCatchToNullErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
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
    "name": "RelayReaderCatchFieldsTestRequiredCatchToNullErrorQuery",
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
        "to": "NULL"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderCatchFieldsTestRequiredCatchToNullErrorQuery",
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
    "cacheID": "713bef185a16770b7bf644cc252f0b9a",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestRequiredCatchToNullErrorQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestRequiredCatchToNullErrorQuery {\n  me {\n    firstName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e2e7f15508ea30b034518ed121f0dba1";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTestRequiredCatchToNullErrorQuery$variables,
  RelayReaderCatchFieldsTestRequiredCatchToNullErrorQuery$data,
>*/);
