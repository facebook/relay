/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9276f54a3796592510241a29eb43416c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserRequiredNameResolver$key } from "./../resolvers/__generated__/UserRequiredNameResolver.graphql";
import {required_name as userRequiredNameResolverType} from "../resolvers/UserRequiredNameResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userRequiredNameResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userRequiredNameResolverType: (
  rootKey: UserRequiredNameResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type RelayReaderResolverTestRequiredQuery$variables = {||};
export type RelayReaderResolverTestRequiredQuery$data = {|
  +me: ?{|
    +required_name: ?string,
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
            "resolverModule": require('../resolvers/UserRequiredNameResolver').required_name,
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
            "name": "required_name",
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
