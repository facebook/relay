/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8b402138caa7773c705a29e66706fc49>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ReactRelayTestMockerTest_me$fragmentType } from "./ReactRelayTestMockerTest_me.graphql";
export type ReactRelayTestMockerTestFragContainerTestQuery$variables = {||};
export type ReactRelayTestMockerTestFragContainerTestQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: ReactRelayTestMockerTest_me$fragmentType,
  |},
|};
export type ReactRelayTestMockerTestFragContainerTestQuery = {|
  response: ReactRelayTestMockerTestFragContainerTestQuery$data,
  variables: ReactRelayTestMockerTestFragContainerTestQuery$variables,
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
  (node/*:: as any*/).hash = "5eed738e34526a06a552a9102d84fbfe";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  ReactRelayTestMockerTestFragContainerTestQuery$variables,
  ReactRelayTestMockerTestFragContainerTestQuery$data,
>*/);
