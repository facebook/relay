/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<42245045c528b065c9dbaad05cc50b79>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderCatchFieldsTestNestedNullQuery$variables = {};
export type RelayReaderCatchFieldsTestNestedNullQuery$data = {
  readonly me: ?{
    readonly lastName: ?string,
  },
};
export type RelayReaderCatchFieldsTestNestedNullQuery = {
  response: RelayReaderCatchFieldsTestNestedNullQuery$data,
  variables: RelayReaderCatchFieldsTestNestedNullQuery$variables,
};
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
    "name": "RelayReaderCatchFieldsTestNestedNullQuery",
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
              "kind": "CatchField",
              "field": (v0/*:: as any*/),
              "to": "NULL"
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
    "name": "RelayReaderCatchFieldsTestNestedNullQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*:: as any*/),
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
    "cacheID": "2c315504ac774ed5e88367d3e2345856",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestNestedNullQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestNestedNullQuery {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "66a2c59d970a93665fcbbb90c9d8c17c";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderCatchFieldsTestNestedNullQuery$variables,
  RelayReaderCatchFieldsTestNestedNullQuery$data,
>*/);
