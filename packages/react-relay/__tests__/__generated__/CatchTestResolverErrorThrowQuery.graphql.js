/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8306d35f8bc01c800ff82e99d659c6b3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
import type { UserAlwaysThrowsResolver$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/UserAlwaysThrowsResolver.graphql";
import {always_throws as userAlwaysThrowsResolverType} from "../../../relay-runtime/store/__tests__/resolvers/UserAlwaysThrowsResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userAlwaysThrowsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userAlwaysThrowsResolverType: (
  rootKey: UserAlwaysThrowsResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type CatchTestResolverErrorThrowQuery$variables = {||};
export type CatchTestResolverErrorThrowQuery$data = {|
  +me: Result<?{|
    +always_throws: ?string,
  |}, unknown>,
|};
export type CatchTestResolverErrorThrowQuery = {|
  response: CatchTestResolverErrorThrowQuery$data,
  variables: CatchTestResolverErrorThrowQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "throwOnFieldError": true
    },
    "name": "CatchTestResolverErrorThrowQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
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
                "name": "UserAlwaysThrowsResolver"
              },
              "kind": "RelayResolver",
              "name": "always_throws",
              "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/UserAlwaysThrowsResolver').always_throws,
              "path": "me.always_throws"
            }
          ],
          "storageKey": null
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "CatchTestResolverErrorThrowQuery",
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
            "name": "always_throws",
            "args": null,
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__typename",
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
    "cacheID": "2db4d58d95a7c9f0ea9cad813980d2a7",
    "id": null,
    "metadata": {},
    "name": "CatchTestResolverErrorThrowQuery",
    "operationKind": "query",
    "text": "query CatchTestResolverErrorThrowQuery {\n  me {\n    ...UserAlwaysThrowsResolver\n    id\n  }\n}\n\nfragment UserAlwaysThrowsResolver on User {\n  __typename\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "a543c7857488a65b428a63d2f1e4f29f";
}

module.exports = ((node/*: any*/)/*: Query<
  CatchTestResolverErrorThrowQuery$variables,
  CatchTestResolverErrorThrowQuery$data,
>*/);
