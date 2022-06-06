/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9945cab265e13e8e76f473cc219a714d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type UserNamePassthroughResolver$key = any;
import userNamePassthroughResolver from "../resolvers/UserNamePassthroughResolver.js";
// Type assertion validating that `userNamePassthroughResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userNamePassthroughResolver: (
  rootKey: UserNamePassthroughResolver$key, 
) => mixed);
export type RelayReaderResolverTest8Query$variables = {||};
export type RelayReaderResolverTest8Query$data = {|
  +me: ?{|
    +name_passthrough: $NonMaybeType<$Call<<R>((...empty[]) => R) => R, typeof userNamePassthroughResolver>>,
  |},
|};
export type RelayReaderResolverTest8Query = {|
  response: RelayReaderResolverTest8Query$data,
  variables: RelayReaderResolverTest8Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest8Query",
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
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "fragment": {
                "args": null,
                "kind": "FragmentSpread",
                "name": "UserNamePassthroughResolver"
              },
              "kind": "RelayResolver",
              "name": "name_passthrough",
              "resolverModule": require('./../resolvers/UserNamePassthroughResolver.js'),
              "path": "me.name_passthrough"
            },
            "action": "NONE",
            "path": "me.name_passthrough"
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
    "name": "RelayReaderResolverTest8Query",
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
    "cacheID": "47b9f85bc1a62cf43538c22f5e2d8d93",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest8Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest8Query {\n  me {\n    ...UserNamePassthroughResolver\n    id\n  }\n}\n\nfragment UserNamePassthroughResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "29f98fc496994fd02e276e0c65235467";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest8Query$variables,
  RelayReaderResolverTest8Query$data,
>*/);
