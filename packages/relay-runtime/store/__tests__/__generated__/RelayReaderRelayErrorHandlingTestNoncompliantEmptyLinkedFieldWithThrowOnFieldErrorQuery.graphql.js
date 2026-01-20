/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<87c3add50b63ba8c6f0bf4938d43228e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithThrowOnFieldErrorQuery$variables = {||};
export type RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithThrowOnFieldErrorQuery$data = {|
  +node: ?{|
    +__typename: string,
    +friends?: ?{|
      +edges: ?ReadonlyArray<?{|
        +cursor: ?string,
      |}>,
    |},
    +id: string,
  |},
|};
export type RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithThrowOnFieldErrorQuery = {|
  response: RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithThrowOnFieldErrorQuery$data,
  variables: RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithThrowOnFieldErrorQuery$variables,
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
            "args": [
              {
                "kind": "Literal",
                "name": "first",
                "value": 3
              }
            ],
            "concreteType": "FriendsConnection",
            "kind": "LinkedField",
            "name": "friends",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "FriendsEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cursor",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "friends(first:3)"
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
    "name": "RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithThrowOnFieldErrorQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithThrowOnFieldErrorQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "b4e49b016710bab100689bfb7b5fd99a",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithThrowOnFieldErrorQuery {\n  node(id: \"1\") {\n    id\n    __typename\n    ... on User {\n      friends(first: 3) {\n        edges {\n          cursor\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f545f883732869b6e4527c5f09a6b5eb";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithThrowOnFieldErrorQuery$variables,
  RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithThrowOnFieldErrorQuery$data,
>*/);
