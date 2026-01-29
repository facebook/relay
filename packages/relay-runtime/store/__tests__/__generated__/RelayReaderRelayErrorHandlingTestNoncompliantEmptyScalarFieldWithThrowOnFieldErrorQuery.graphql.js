/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b5a527b8460b00ff4b0becf21e3b2768>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithThrowOnFieldErrorQuery$variables = {||};
export type RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithThrowOnFieldErrorQuery$data = {|
  +node: ?{|
    +__typename: string,
    +emailAddresses?: ?ReadonlyArray<?string>,
    +id: string,
  |},
|};
export type RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithThrowOnFieldErrorQuery = {|
  response: RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithThrowOnFieldErrorQuery$data,
  variables: RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithThrowOnFieldErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "id",
        "value": "1"
      }
    ],
    "concreteType": null,
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "__typename",
        "storageKey": null
      },
      {
        "kind": "InlineFragment",
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "emailAddresses",
            "storageKey": null
          }
        ],
        "type": "User",
        "abstractKey": null
      }
    ],
    "storageKey": "node(id:\"1\")"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "throwOnFieldError": true
    },
    "name": "RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithThrowOnFieldErrorQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithThrowOnFieldErrorQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "2f8f0fea05a87b91ed80d5f62dd9308c",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithThrowOnFieldErrorQuery {\n  node(id: \"1\") {\n    id\n    __typename\n    ... on User {\n      emailAddresses\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "39bcfd3ec0582f9ae2c60746ee9c98a3";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithThrowOnFieldErrorQuery$variables,
  RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithThrowOnFieldErrorQuery$data,
>*/);
