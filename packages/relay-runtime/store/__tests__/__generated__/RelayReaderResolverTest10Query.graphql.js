/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fabae5151b0b5d86ef2bb4a691514cf9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import userGreetingResolver from "../../../../relay-test-utils-internal/resolvers/UserGreetingResolver.js";
export type RelayReaderResolverTest10Query$variables = {||};
export type RelayReaderResolverTest10Query$data = {|
  +me: ?{|
    +greeting: ?$Call<<R>((...empty[]) => R) => R, typeof userGreetingResolver>,
  |},
|};
export type RelayReaderResolverTest10Query = {|
  response: RelayReaderResolverTest10Query$data,
  variables: RelayReaderResolverTest10Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest10Query",
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
    "name": "RelayReaderResolverTest10Query",
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
    "cacheID": "c7bfc3113cc3c09797f237a95fafc408",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest10Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest10Query {\n  me {\n    ...UserGreetingResolver\n    id\n  }\n}\n\nfragment UserGreetingResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "368f0a9a504a265358b85851f8af61fa";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest10Query$variables,
  RelayReaderResolverTest10Query$data,
>*/);
