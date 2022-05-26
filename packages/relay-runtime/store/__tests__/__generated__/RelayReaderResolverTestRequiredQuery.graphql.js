/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<26015199056f49e7265cc6e11892a322>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import userRequiredNameResolver from "../../../../relay-test-utils-internal/resolvers/UserRequiredNameResolver.js";
export type RelayReaderResolverTestRequiredQuery$variables = {||};
export type RelayReaderResolverTestRequiredQuery$data = {|
  +me: ?{|
    +required_name: ?$Call<<R>((...empty[]) => R) => R, typeof userRequiredNameResolver>,
  |},
|};
export type RelayReaderResolverTestRequiredQuery = {|
  response: RelayReaderResolverTestRequiredQuery$data,
  variables: RelayReaderResolverTestRequiredQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTestRequiredQuery",
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
              "name": "UserRequiredNameResolver"
            },
            "kind": "RelayResolver",
            "name": "required_name",
            "resolverModule": require('./../../../../relay-test-utils-internal/resolvers/UserRequiredNameResolver.js'),
            "path": "me.required_name"
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
    "name": "RelayReaderResolverTestRequiredQuery",
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
    "cacheID": "982bbad09d50fdab375e8c33b363967c",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTestRequiredQuery",
    "operationKind": "query",
    "text": "query RelayReaderResolverTestRequiredQuery {\n  me {\n    ...UserRequiredNameResolver\n    id\n  }\n}\n\nfragment UserRequiredNameResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "87c7958b00f0a3e6132ce99279b5af8b";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTestRequiredQuery$variables,
  RelayReaderResolverTestRequiredQuery$data,
>*/);
