/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d1d4f6cef28b7fd0edebd347e0f847dc>>
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
export type RelayReaderResolverTestMarkCleanQuery$variables = {||};
export type RelayReaderResolverTestMarkCleanQuery$data = {|
  +me: ?{|
    +constant_dependent: ?number,
  |},
|};
export type RelayReaderResolverTestMarkCleanQuery = {|
  response: RelayReaderResolverTestMarkCleanQuery$data,
  variables: RelayReaderResolverTestMarkCleanQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTestMarkCleanQuery",
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
    "name": "RelayReaderResolverTestMarkCleanQuery",
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
    "cacheID": "7d364ec2e4a00451fe2f21b8bf8d6a34",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTestMarkCleanQuery",
    "operationKind": "query",
    "text": "query RelayReaderResolverTestMarkCleanQuery {\n  me {\n    ...UserConstantDependentResolver\n    id\n  }\n}\n\nfragment UserConstantDependentResolver on User {\n  ...UserConstantResolver\n}\n\nfragment UserConstantResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "a7af7fda9e61cae33b58462f1322e3cd";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTestMarkCleanQuery$variables,
  RelayReaderResolverTestMarkCleanQuery$data,
>*/);
