/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6aff0d38559b7de9e380a250352afc56>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithoutThrowOnFieldErrorQuery$variables = {||};
export type RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithoutThrowOnFieldErrorQuery$data = {|
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
export type RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithoutThrowOnFieldErrorQuery = {|
  response: RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithoutThrowOnFieldErrorQuery$data,
  variables: RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithoutThrowOnFieldErrorQuery$variables,
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
    "metadata": null,
    "name": "RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithoutThrowOnFieldErrorQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithoutThrowOnFieldErrorQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "9bcd1fa083106133acd9429ae203b4c6",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithoutThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithoutThrowOnFieldErrorQuery {\n  node(id: \"1\") {\n    id\n    __typename\n    ... on User {\n      friends(first: 3) {\n        edges {\n          cursor\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f4834de5be0525aba139b83eb190e02f";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithoutThrowOnFieldErrorQuery$variables,
  RelayReaderRelayErrorHandlingTestNoncompliantEmptyLinkedFieldWithoutThrowOnFieldErrorQuery$data,
>*/);
