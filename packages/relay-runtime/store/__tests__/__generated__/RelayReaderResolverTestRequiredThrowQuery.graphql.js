/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6fdb211810bba759d4a03e5e17338e6f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserRequiredThrowNameResolver$key } from "./../resolvers/__generated__/UserRequiredThrowNameResolver.graphql";
import {required_throw_name as userRequiredThrowNameResolverType} from "../resolvers/UserRequiredThrowNameResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userRequiredThrowNameResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userRequiredThrowNameResolverType: (
  rootKey: UserRequiredThrowNameResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type RelayReaderResolverTestRequiredThrowQuery$variables = {||};
export type RelayReaderResolverTestRequiredThrowQuery$data = {|
  +me: ?{|
    +required_throw_name: ?string,
  |},
|};
export type RelayReaderResolverTestRequiredThrowQuery = {|
  response: RelayReaderResolverTestRequiredThrowQuery$data,
  variables: RelayReaderResolverTestRequiredThrowQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTestRequiredThrowQuery",
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
              "name": "UserRequiredThrowNameResolver"
            },
            "kind": "RelayResolver",
            "name": "required_throw_name",
            "resolverModule": require('../resolvers/UserRequiredThrowNameResolver').required_throw_name,
            "path": "me.required_throw_name"
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
    "name": "RelayReaderResolverTestRequiredThrowQuery",
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
            "name": "required_throw_name",
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
    "cacheID": "bf7da4ab16e3296283aeca5290da4151",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTestRequiredThrowQuery",
    "operationKind": "query",
    "text": "query RelayReaderResolverTestRequiredThrowQuery {\n  me {\n    ...UserRequiredThrowNameResolver\n    id\n  }\n}\n\nfragment UserRequiredThrowNameResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "ac98b44e6541cf421098daaa34ca1e8d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTestRequiredThrowQuery$variables,
  RelayReaderResolverTestRequiredThrowQuery$data,
>*/);
