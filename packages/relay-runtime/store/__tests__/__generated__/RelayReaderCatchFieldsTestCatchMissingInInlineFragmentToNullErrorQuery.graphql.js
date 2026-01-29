/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<278d9b1e89a80b5ae4ced17c29a015ff>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToNullErrorQuery$variables = {||};
export type RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToNullErrorQuery$data = {|
  +me: ?{|
    +myAlias?: {|
      +firstName: ?string,
    |},
  |},
|};
export type RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToNullErrorQuery = {|
  response: RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToNullErrorQuery$data,
  variables: RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToNullErrorQuery$variables,
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
    "name": "RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToNullErrorQuery",
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
    "name": "RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToNullErrorQuery",
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
    "cacheID": "b9601f393b04f3696857ed6207e3aafd",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToNullErrorQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToNullErrorQuery {\n  me {\n    firstName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6d744c6b81261213c472eb1cb90e661f";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToNullErrorQuery$variables,
  RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToNullErrorQuery$data,
>*/);
