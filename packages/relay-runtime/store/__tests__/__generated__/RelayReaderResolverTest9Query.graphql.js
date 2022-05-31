/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3f3e2c811ddd81d49559f1fc58986422>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import userGreetingResolver from "../../../../relay-test-utils-internal/resolvers/UserGreetingResolver.js";
export type RelayReaderResolverTest9Query$variables = {||};
export type RelayReaderResolverTest9Query$data = {|
  +me: ?{|
    +greeting: ?$Call<<R>((...empty[]) => R) => R, typeof userGreetingResolver>,
  |},
|};
export type RelayReaderResolverTest9Query = {|
  response: RelayReaderResolverTest9Query$data,
  variables: RelayReaderResolverTest9Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest9Query",
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
            "resolverModule": require('./../../../../relay-test-utils-internal/resolvers/UserGreetingResolver.js'),
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
    "name": "RelayReaderResolverTest9Query",
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
    "cacheID": "209fc49fa0969943ad140ada97dae445",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest9Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest9Query {\n  me {\n    ...UserGreetingResolver\n    id\n  }\n}\n\nfragment UserGreetingResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "4c7810c40bd82295b6409b248b3deea9";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest9Query$variables,
  RelayReaderResolverTest9Query$data,
>*/);
