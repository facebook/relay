/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9f93319d8262b4fcf14ad8204c535d54>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
export type RelayReaderCatchFieldsTestCatchOkInAliasedInlineFragmentToResultQuery$variables = {||};
export type RelayReaderCatchFieldsTestCatchOkInAliasedInlineFragmentToResultQuery$data = {|
  +me: ?{|
    +myAlias: Result<{|
      +lastName: ?string,
    |}, unknown>,
  |},
|};
export type RelayReaderCatchFieldsTestCatchOkInAliasedInlineFragmentToResultQuery = {|
  response: RelayReaderCatchFieldsTestCatchOkInAliasedInlineFragmentToResultQuery$data,
  variables: RelayReaderCatchFieldsTestCatchOkInAliasedInlineFragmentToResultQuery$variables,
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
    "name": "RelayReaderCatchFieldsTestCatchOkInAliasedInlineFragmentToResultQuery",
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
    "name": "RelayReaderCatchFieldsTestCatchOkInAliasedInlineFragmentToResultQuery",
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
    "cacheID": "d9988c292d41880fe09523f3695c8250",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestCatchOkInAliasedInlineFragmentToResultQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestCatchOkInAliasedInlineFragmentToResultQuery {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b66caaad067e04cc80cef82fcfcc7390";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTestCatchOkInAliasedInlineFragmentToResultQuery$variables,
  RelayReaderCatchFieldsTestCatchOkInAliasedInlineFragmentToResultQuery$data,
>*/);
