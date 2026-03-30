/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<53dcf8678d75301197d4c13000cc1d7e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserGreetingResolver$key } from "./../resolvers/__generated__/UserGreetingResolver.graphql";
import {greeting as userGreetingResolverType} from "../resolvers/UserGreetingResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userGreetingResolverType as (
  rootKey: UserGreetingResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type RelayReaderResolverTest11Query$variables = {||};
export type RelayReaderResolverTest11Query$data = {|
  +me: ?{|
    +the_alias: ?string,
  |},
|};
export type RelayReaderResolverTest11Query = {|
  response: RelayReaderResolverTest11Query$data,
  variables: RelayReaderResolverTest11Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest11Query",
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
            "alias": "the_alias",
            "args": null,
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UserGreetingResolver"
            },
            "kind": "RelayResolver",
            "name": "greeting",
            "resolverModule": require('../resolvers/UserGreetingResolver').greeting,
            "path": "me.the_alias"
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
    "name": "RelayReaderResolverTest11Query",
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
    "cacheID": "f32d52acab57729e39888a02cb39a354",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest11Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest11Query {\n  me {\n    ...UserGreetingResolver\n    id\n  }\n}\n\nfragment UserGreetingResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*:: as any*/).hash = "0ffc616b56144eb42669705c784e4542";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderResolverTest11Query$variables,
  RelayReaderResolverTest11Query$data,
>*/);
