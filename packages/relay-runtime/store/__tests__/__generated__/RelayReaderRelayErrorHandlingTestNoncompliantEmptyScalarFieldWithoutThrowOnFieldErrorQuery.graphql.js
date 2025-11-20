/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3c7ba045f9dc9647eef8d8d1d79d29ca>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithoutThrowOnFieldErrorQuery$variables = {||};
export type RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithoutThrowOnFieldErrorQuery$data = {|
  +node: ?{|
    +__typename: string,
    +emailAddresses?: ?ReadonlyArray<?string>,
    +id: string,
  |},
|};
export type RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithoutThrowOnFieldErrorQuery = {|
  response: RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithoutThrowOnFieldErrorQuery$data,
  variables: RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithoutThrowOnFieldErrorQuery$variables,
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
    "metadata": null,
    "name": "RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithoutThrowOnFieldErrorQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithoutThrowOnFieldErrorQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "a278c7d054186ae97ab78b656d9a57c6",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithoutThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithoutThrowOnFieldErrorQuery {\n  node(id: \"1\") {\n    id\n    __typename\n    ... on User {\n      emailAddresses\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fbd6702b1d66c9949d49205fa661c44f";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithoutThrowOnFieldErrorQuery$variables,
  RelayReaderRelayErrorHandlingTestNoncompliantEmptyScalarFieldWithoutThrowOnFieldErrorQuery$data,
>*/);
