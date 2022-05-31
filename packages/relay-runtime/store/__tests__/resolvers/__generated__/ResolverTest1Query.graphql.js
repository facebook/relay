/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<626ac05184ed22cf72df4106e76b7e38>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import userGreetingResolver from "../../../../../relay-test-utils-internal/resolvers/UserGreetingResolver.js";
export type ResolverTest1Query$variables = {||};
export type ResolverTest1Query$data = {|
  +me: ?{|
    +greeting: ?$Call<<R>((...empty[]) => R) => R, typeof userGreetingResolver>,
  |},
|};
export type ResolverTest1Query = {|
  response: ResolverTest1Query$data,
  variables: ResolverTest1Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResolverTest1Query",
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
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UserGreetingResolver"
            },
            "kind": "RelayResolver",
            "name": "greeting",
            "resolverModule": require('./../../../../../relay-test-utils-internal/resolvers/UserGreetingResolver.js'),
            "path": "me.greeting"
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
    "name": "ResolverTest1Query",
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
    "cacheID": "3a1eaeb0e3b9196ca87de9b8f7ad955b",
    "id": null,
    "metadata": {},
    "name": "ResolverTest1Query",
    "operationKind": "query",
    "text": "query ResolverTest1Query {\n  me {\n    ...UserGreetingResolver\n    id\n  }\n}\n\nfragment UserGreetingResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "66cb0d41878bc7976e92f5b0b87090c9";
}

module.exports = ((node/*: any*/)/*: Query<
  ResolverTest1Query$variables,
  ResolverTest1Query$data,
>*/);
