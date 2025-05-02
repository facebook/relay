/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<96c3ffb47638b01931d8b0504df03a24>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserShoutedGreetingResolver$key } from "./../resolvers/__generated__/UserShoutedGreetingResolver.graphql";
import {shouted_greeting as userShoutedGreetingResolverType} from "../resolvers/UserShoutedGreetingResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userShoutedGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userShoutedGreetingResolverType: (
  rootKey: UserShoutedGreetingResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type RelayReaderResolverTest5Query$variables = {||};
export type RelayReaderResolverTest5Query$data = {|
  +me: ?{|
    +shouted_greeting: ?string,
  |},
|};
export type RelayReaderResolverTest5Query = {|
  response: RelayReaderResolverTest5Query$data,
  variables: RelayReaderResolverTest5Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest5Query",
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
              "name": "UserShoutedGreetingResolver"
            },
            "kind": "RelayResolver",
            "name": "shouted_greeting",
            "resolverModule": require('../resolvers/UserShoutedGreetingResolver').shouted_greeting,
            "path": "me.shouted_greeting"
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
    "name": "RelayReaderResolverTest5Query",
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
            "name": "shouted_greeting",
            "args": null,
            "fragment": {
              "kind": "InlineFragment",
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
    "cacheID": "9ac5d21016361585514ac99107e009db",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest5Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest5Query {\n  me {\n    ...UserShoutedGreetingResolver\n    id\n  }\n}\n\nfragment UserGreetingResolver on User {\n  name\n}\n\nfragment UserShoutedGreetingResolver on User {\n  ...UserGreetingResolver\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "ffe920eb282ee34cabda32437c7bdd3d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest5Query$variables,
  RelayReaderResolverTest5Query$data,
>*/);
