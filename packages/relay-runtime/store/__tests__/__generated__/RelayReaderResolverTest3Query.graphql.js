/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d052fdb192ae5fd790f16b999f6ca2d0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import userGreetingResolver from "../resolvers/DummyUserGreetingResolver.js";
export type RelayReaderResolverTest3Query$variables = {||};
export type RelayReaderResolverTest3Query$data = {|
  +me: ?{|
    +greeting: ?$Call<<R>((...empty[]) => R) => R, typeof userGreetingResolver>,
  |},
|};
export type RelayReaderResolverTest3Query = {|
  response: RelayReaderResolverTest3Query$data,
  variables: RelayReaderResolverTest3Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest3Query",
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
              "name": "DummyUserGreetingResolver"
            },
            "kind": "RelayResolver",
            "name": "greeting",
            "resolverModule": require('./../resolvers/DummyUserGreetingResolver.js'),
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
    "name": "RelayReaderResolverTest3Query",
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
    "cacheID": "e4ab53858306a3c8ad737477b12f99c8",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest3Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest3Query {\n  me {\n    ...DummyUserGreetingResolver\n    id\n  }\n}\n\nfragment DummyUserGreetingResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "080623e899548e51f315204f5c472726";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest3Query$variables,
  RelayReaderResolverTest3Query$data,
>*/);
