/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<32be1613d5c372bcbbb67f0545896271>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
export type RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToResultQuery$variables = {||};
export type RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToResultQuery$data = {|
  +me: ?{|
    +myAlias: Result<{|
      +lastName: ?string,
    |}, unknown>,
  |},
|};
export type RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToResultQuery = {|
  response: RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToResultQuery$data,
  variables: RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToResultQuery$variables,
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
    "name": "RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToResultQuery",
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
            "field": {
              "fragment": {
                "kind": "InlineFragment",
                "selections": [
                  (v0/*: any*/)
                ],
                "type": null,
                "abstractKey": null
              },
              "kind": "AliasedInlineFragmentSpread",
              "name": "myAlias"
            },
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
    "name": "RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToResultQuery",
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
    "cacheID": "678d2635ebfd7bb1d0e4c570057c7d76",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToResultQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToResultQuery {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a70c49c9b3548984afd4a79926685e1e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToResultQuery$variables,
  RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToResultQuery$data,
>*/);
