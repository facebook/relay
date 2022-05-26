/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<628e4f1b291b05d0aea955eea7a7f4da>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import userGreetingResolver from "../resolvers/DummyUserGreetingResolver.js";
export type RelayReaderResolverTestMissingDataQuery$variables = {||};
export type RelayReaderResolverTestMissingDataQuery$data = {|
  +me: ?{|
    +greeting: ?$Call<<R>((...empty[]) => R) => R, typeof userGreetingResolver>,
  |},
|};
export type RelayReaderResolverTestMissingDataQuery = {|
  response: RelayReaderResolverTestMissingDataQuery$data,
  variables: RelayReaderResolverTestMissingDataQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTestMissingDataQuery",
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
    "name": "RelayReaderResolverTestMissingDataQuery",
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
    "cacheID": "cf532aa732bd4c49ca8cf03768791cf2",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTestMissingDataQuery",
    "operationKind": "query",
    "text": "query RelayReaderResolverTestMissingDataQuery {\n  me {\n    ...DummyUserGreetingResolver\n    id\n  }\n}\n\nfragment DummyUserGreetingResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "470952d4344f871892f58703997748ea";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTestMissingDataQuery$variables,
  RelayReaderResolverTestMissingDataQuery$data,
>*/);
