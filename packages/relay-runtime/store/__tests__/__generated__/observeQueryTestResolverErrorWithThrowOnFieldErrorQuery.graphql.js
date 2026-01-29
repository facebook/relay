/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bd90cca9b044b078325f3888b466808f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserAlwaysThrowsResolver$key } from "./../resolvers/__generated__/UserAlwaysThrowsResolver.graphql";
import {always_throws as userAlwaysThrowsResolverType} from "../resolvers/UserAlwaysThrowsResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userAlwaysThrowsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userAlwaysThrowsResolverType: (
  rootKey: UserAlwaysThrowsResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type observeQueryTestResolverErrorWithThrowOnFieldErrorQuery$variables = {||};
export type observeQueryTestResolverErrorWithThrowOnFieldErrorQuery$data = {|
  +me: ?{|
    +always_throws: ?string,
  |},
|};
export type observeQueryTestResolverErrorWithThrowOnFieldErrorQuery = {|
  response: observeQueryTestResolverErrorWithThrowOnFieldErrorQuery$data,
  variables: observeQueryTestResolverErrorWithThrowOnFieldErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "throwOnFieldError": true
    },
    "name": "observeQueryTestResolverErrorWithThrowOnFieldErrorQuery",
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
              "name": "UserAlwaysThrowsResolver"
            },
            "kind": "RelayResolver",
            "name": "always_throws",
            "resolverModule": require('../resolvers/UserAlwaysThrowsResolver').always_throws,
            "path": "me.always_throws"
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
    "name": "observeQueryTestResolverErrorWithThrowOnFieldErrorQuery",
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
    "cacheID": "d7bef3f05a4033e1460dbe3276e7926b",
    "id": null,
    "metadata": {},
    "name": "observeQueryTestResolverErrorWithThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query observeQueryTestResolverErrorWithThrowOnFieldErrorQuery {\n  me {\n    ...UserAlwaysThrowsResolver\n    id\n  }\n}\n\nfragment UserAlwaysThrowsResolver on User {\n  __typename\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "37e387539b481973fc13b94cc329ce2a";
}

module.exports = ((node/*: any*/)/*: Query<
  observeQueryTestResolverErrorWithThrowOnFieldErrorQuery$variables,
  observeQueryTestResolverErrorWithThrowOnFieldErrorQuery$data,
>*/);
