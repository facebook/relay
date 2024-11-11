/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<67f563748ffa65c324ce15cd5d8fb5ff>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderCatchFieldsTestCatchMissingToNullErrorQuery$variables = {||};
export type RelayReaderCatchFieldsTestCatchMissingToNullErrorQuery$data = {|
  +me: ?{|
    +firstName: ?string,
  |},
|};
export type RelayReaderCatchFieldsTestCatchMissingToNullErrorQuery = {|
  response: RelayReaderCatchFieldsTestCatchMissingToNullErrorQuery$data,
  variables: RelayReaderCatchFieldsTestCatchMissingToNullErrorQuery$variables,
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
    "name": "RelayReaderCatchFieldsTestCatchMissingToNullErrorQuery",
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
            (v0/*: any*/)
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
    "name": "RelayReaderCatchFieldsTestCatchMissingToNullErrorQuery",
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
    "cacheID": "5749a2c40b6b6bee39de090c22589785",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestCatchMissingToNullErrorQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestCatchMissingToNullErrorQuery {\n  me {\n    firstName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "240f1d3a110a2baa0b0c2a28c485e93d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTestCatchMissingToNullErrorQuery$variables,
  RelayReaderCatchFieldsTestCatchMissingToNullErrorQuery$data,
>*/);
