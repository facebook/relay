/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<60f62f906d38fb0b33e62d87e40efff5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserConstantDependentResolver$key } from "./../resolvers/__generated__/UserConstantDependentResolver.graphql";
import {constant_dependent as userConstantDependentResolverType} from "../resolvers/UserConstantDependentResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userConstantDependentResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userConstantDependentResolverType: (
  rootKey: UserConstantDependentResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?number);
export type RelayReaderResolverTest2Query$variables = {||};
export type RelayReaderResolverTest2Query$data = {|
  +me: ?{|
    +constant_dependent: ?number,
  |},
|};
export type RelayReaderResolverTest2Query = {|
  response: RelayReaderResolverTest2Query$data,
  variables: RelayReaderResolverTest2Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTest2Query",
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
              "name": "UserConstantDependentResolver"
            },
            "kind": "RelayResolver",
            "name": "constant_dependent",
            "resolverModule": require('../resolvers/UserConstantDependentResolver').constant_dependent,
            "path": "me.constant_dependent"
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
    "name": "RelayReaderResolverTest2Query",
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
            "name": "constant_dependent",
            "args": null,
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "name": "constant",
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
    "cacheID": "38545ed7d1b392b27e632a5e39c9441e",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest2Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest2Query {\n  me {\n    ...UserConstantDependentResolver\n    id\n  }\n}\n\nfragment UserConstantDependentResolver on User {\n  ...UserConstantResolver\n}\n\nfragment UserConstantResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "fd0c2d161f1a5237011571fb21fabd9c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest2Query$variables,
  RelayReaderResolverTest2Query$data,
>*/);
