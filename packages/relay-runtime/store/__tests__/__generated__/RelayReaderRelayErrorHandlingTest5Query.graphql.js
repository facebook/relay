/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<88410745e66537fa4174c9fe5183f8e8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserLastNameThrowOnFieldErrorResolver$key } from "./../resolvers/__generated__/UserLastNameThrowOnFieldErrorResolver.graphql";
import {last_name_throw_on_field_error as userLastNameThrowOnFieldErrorResolverType} from "../resolvers/UserLastNameThrowOnFieldError.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userLastNameThrowOnFieldErrorResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userLastNameThrowOnFieldErrorResolverType: (
  rootKey: UserLastNameThrowOnFieldErrorResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type RelayReaderRelayErrorHandlingTest5Query$variables = {||};
export type RelayReaderRelayErrorHandlingTest5Query$data = {|
  +me: ?{|
    +last_name_throw_on_field_error: ?string,
  |},
|};
export type RelayReaderRelayErrorHandlingTest5Query = {|
  response: RelayReaderRelayErrorHandlingTest5Query$data,
  variables: RelayReaderRelayErrorHandlingTest5Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "throwOnFieldError": true
    },
    "name": "RelayReaderRelayErrorHandlingTest5Query",
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
              "name": "UserLastNameThrowOnFieldErrorResolver"
            },
            "kind": "RelayResolver",
            "name": "last_name_throw_on_field_error",
            "resolverModule": require('../resolvers/UserLastNameThrowOnFieldError').last_name_throw_on_field_error,
            "path": "me.last_name_throw_on_field_error"
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
    "name": "RelayReaderRelayErrorHandlingTest5Query",
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
            "name": "last_name_throw_on_field_error",
            "args": null,
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "lastName",
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
    "cacheID": "cf40f623182860f8b13946251531eacd",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTest5Query",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTest5Query {\n  me {\n    ...UserLastNameThrowOnFieldErrorResolver\n    id\n  }\n}\n\nfragment UserLastNameThrowOnFieldErrorResolver on User {\n  lastName\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "c43a45aef66b2d0282889bad58ad0196";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRelayErrorHandlingTest5Query$variables,
  RelayReaderRelayErrorHandlingTest5Query$data,
>*/);
