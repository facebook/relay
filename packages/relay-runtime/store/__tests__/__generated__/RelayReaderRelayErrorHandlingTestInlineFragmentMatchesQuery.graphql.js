/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ac84fe2fe44c8d19a9d454523bef2f1d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRelayErrorHandlingTestInlineFragmentMatchesQuery$variables = {||};
export type RelayReaderRelayErrorHandlingTestInlineFragmentMatchesQuery$data = {|
  +node: ?{|
    +name?: ?string,
  |},
|};
export type RelayReaderRelayErrorHandlingTestInlineFragmentMatchesQuery = {|
  response: RelayReaderRelayErrorHandlingTestInlineFragmentMatchesQuery$data,
  variables: RelayReaderRelayErrorHandlingTestInlineFragmentMatchesQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "4"
  }
],
v1 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "MaybeNodeInterface",
  "abstractKey": "__isMaybeNodeInterface"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "throwOnFieldError": true
    },
    "name": "RelayReaderRelayErrorHandlingTestInlineFragmentMatchesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/)
        ],
        "storageKey": "node(id:\"4\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRelayErrorHandlingTestInlineFragmentMatchesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": "node(id:\"4\")"
      }
    ]
  },
  "params": {
    "cacheID": "0f7c4db114ac13634196313c2e57f4e4",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTestInlineFragmentMatchesQuery",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTestInlineFragmentMatchesQuery {\n  node(id: \"4\") {\n    __typename\n    ... on MaybeNodeInterface {\n      __isMaybeNodeInterface: __typename\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5a20c30977bc87aac1a6449bc034610e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRelayErrorHandlingTestInlineFragmentMatchesQuery$variables,
  RelayReaderRelayErrorHandlingTestInlineFragmentMatchesQuery$data,
>*/);
