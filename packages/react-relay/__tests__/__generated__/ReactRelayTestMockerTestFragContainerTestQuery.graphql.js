/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<33eb078b99076f9647176706d721bbf8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type ReactRelayTestMockerTest_me$ref = any;
export type ReactRelayTestMockerTestFragContainerTestQueryVariables = {||};
export type ReactRelayTestMockerTestFragContainerTestQueryResponse = {|
  +me: ?{|
    +$fragmentRefs: ReactRelayTestMockerTest_me$ref,
  |},
|};
export type ReactRelayTestMockerTestFragContainerTestQuery = {|
  variables: ReactRelayTestMockerTestFragContainerTestQueryVariables,
  response: ReactRelayTestMockerTestFragContainerTestQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ReactRelayTestMockerTestFragContainerTestQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "ReactRelayTestMockerTest_me"
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
    "name": "ReactRelayTestMockerTestFragContainerTestQuery",
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
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
    "cacheID": "748887014f9326ff9c5f00b25f9374eb",
    "id": null,
    "metadata": {},
    "name": "ReactRelayTestMockerTestFragContainerTestQuery",
    "operationKind": "query",
    "text": "query ReactRelayTestMockerTestFragContainerTestQuery {\n  me {\n    ...ReactRelayTestMockerTest_me\n    id\n  }\n}\n\nfragment ReactRelayTestMockerTest_me on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "5eed738e34526a06a552a9102d84fbfe";
}

module.exports = node;
