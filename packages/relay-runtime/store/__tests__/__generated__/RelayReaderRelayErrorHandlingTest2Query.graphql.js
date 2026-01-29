/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f23086d5ecde83b4b2d8ed8130162b9f>>
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
export type RelayReaderRelayErrorHandlingTest2Query$variables = {||};
export type RelayReaderRelayErrorHandlingTest2Query$data = {|
  +me: ?{|
    +last_name_throw_on_field_error: ?string,
  |},
|};
export type RelayReaderRelayErrorHandlingTest2Query = {|
  response: RelayReaderRelayErrorHandlingTest2Query$data,
  variables: RelayReaderRelayErrorHandlingTest2Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderRelayErrorHandlingTest2Query",
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
    "name": "RelayReaderRelayErrorHandlingTest2Query",
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
    "cacheID": "ee38e3741e721d0898e3a026012261bd",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTest2Query",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTest2Query {\n  me {\n    ...UserLastNameThrowOnFieldErrorResolver\n    id\n  }\n}\n\nfragment UserLastNameThrowOnFieldErrorResolver on User {\n  lastName\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "f1898474d6207f6accbdf61340aef474";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRelayErrorHandlingTest2Query$variables,
  RelayReaderRelayErrorHandlingTest2Query$data,
>*/);
