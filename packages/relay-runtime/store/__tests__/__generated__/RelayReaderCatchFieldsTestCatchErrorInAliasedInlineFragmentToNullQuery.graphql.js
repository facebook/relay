/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<af5561b1a642bfab2f2c3c5219a98e7d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToNullQuery$variables = {||};
export type RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToNullQuery$data = {|
  +me: ?{|
    +myAlias?: {|
      +lastName: ?string,
    |},
  |},
|};
export type RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToNullQuery = {|
  response: RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToNullQuery$data,
  variables: RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToNullQuery$variables,
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
    "name": "RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToNullQuery",
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
            "to": "NULL"
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
    "name": "RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToNullQuery",
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
    "cacheID": "68eb5d21a6bffe5da13c5a897b8eb2c0",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToNullQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToNullQuery {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2b1ea6d0218c5f047670fc927888abd6";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToNullQuery$variables,
  RelayReaderCatchFieldsTestCatchErrorInAliasedInlineFragmentToNullQuery$data,
>*/);
