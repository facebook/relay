/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<84ea7454194b7f00c9465226d7d03823>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserGreetingResolver$key } from "./../resolvers/__generated__/UserGreetingResolver.graphql";
import {greeting as userGreetingResolverType} from "../resolvers/UserGreetingResolver.js";
// Type assertion validating that `userGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userGreetingResolverType: (
  rootKey: UserGreetingResolver$key,
) => ?string);
export type RelayReaderResolverTest3Query$variables = {||};
export type RelayReaderResolverTest3Query$data = {|
  +me: ?{|
    +greeting: ?string,
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
              "name": "UserGreetingResolver"
            },
            "kind": "RelayResolver",
            "name": "greeting",
            "resolverModule": require('./../resolvers/UserGreetingResolver').greeting,
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
            "name": "greeting",
            "args": null,
            "fragment": {
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
              "type": "User",
              "abstractKey": null
            },
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": true
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
    "cacheID": "1d5b641d3646a328e79dbc75e2715413",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest3Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest3Query {\n  me {\n    ...UserGreetingResolver\n    id\n  }\n}\n\nfragment UserGreetingResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "080623e899548e51f315204f5c472726";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest3Query$variables,
  RelayReaderResolverTest3Query$data,
>*/);
