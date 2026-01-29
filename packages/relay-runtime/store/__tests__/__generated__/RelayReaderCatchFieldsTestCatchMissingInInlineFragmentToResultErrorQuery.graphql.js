/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8210e320f3b8235f4c53c47b99d77303>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
export type RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToResultErrorQuery$variables = {||};
export type RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToResultErrorQuery$data = {|
  +me: ?{|
    +myAlias: Result<{|
      +firstName: ?string,
    |}, unknown>,
  |},
|};
export type RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToResultErrorQuery = {|
  response: RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToResultErrorQuery$data,
  variables: RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToResultErrorQuery$variables,
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
    "name": "RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToResultErrorQuery",
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
    "name": "RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToResultErrorQuery",
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
    "cacheID": "be64915a8f105c5ec546be0b83377407",
    "id": null,
    "metadata": {},
    "name": "RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToResultErrorQuery",
    "operationKind": "query",
    "text": "query RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToResultErrorQuery {\n  me {\n    firstName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "70b3512560504ebf42fd02ac2a26bb17";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToResultErrorQuery$variables,
  RelayReaderCatchFieldsTestCatchMissingInInlineFragmentToResultErrorQuery$data,
>*/);
