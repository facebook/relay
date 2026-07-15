/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<84dcee9c3ba8c6ba7c543fc1aa445f05>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
export type RelayReaderCatchFieldsTestNestedResultQuery$variables = {};
export type RelayReaderCatchFieldsTestNestedResultQuery$data = {
  readonly me: Result<?{
    readonly lastName: Result<?string, unknown>,
  }, unknown>,
};
export type RelayReaderCatchFieldsTestNestedResultQuery = {
  response: RelayReaderCatchFieldsTestNestedResultQuery$data,
  variables: RelayReaderCatchFieldsTestNestedResultQuery$variables,
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
    "name": "RelayReaderCatchFieldsTestNestedResultQuery",
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
              "to": "RESULT"
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
    "name": "RelayReaderCatchFieldsTestNestedResultQuery",
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
    "cacheID": "f9e292ecc5dd08b5d8be80b0da603841",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestNestedResultQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestNestedResultQuery {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "91b7b93adcadec991cfe6f6bb03fcc1d";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderCatchFieldsTestNestedResultQuery$variables,
  RelayReaderCatchFieldsTestNestedResultQuery$data,
>*/);
