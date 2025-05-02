/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2e4f7bb7765b2aa5412110074d4299b6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import type { LiveCounterResolver$key } from "./LiveCounterResolver.graphql";
import {counter as queryCounterResolverType} from "../LiveCounterResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryCounterResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterResolverType: (
  rootKey: LiveCounterResolver$key,
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
export type ResolverGCTestLiveWithRootFragmentQuery$variables = {||};
export type ResolverGCTestLiveWithRootFragmentQuery$data = {|
  +counter: ?number,
|};
export type ResolverGCTestLiveWithRootFragmentQuery = {|
  response: ResolverGCTestLiveWithRootFragmentQuery$data,
  variables: ResolverGCTestLiveWithRootFragmentQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResolverGCTestLiveWithRootFragmentQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "LiveCounterResolver"
        },
        "kind": "RelayLiveResolver",
        "name": "counter",
        "resolverModule": require('../LiveCounterResolver').counter,
        "path": "counter"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ResolverGCTestLiveWithRootFragmentQuery",
    "selections": [
      {
        "name": "counter",
        "args": null,
        "fragment": {
          "kind": "InlineFragment",
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
                  "name": "id",
                  "storageKey": null
                },
                {
                  "kind": "ClientExtension",
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "__id",
                      "storageKey": null
                    }
                  ]
                }
              ],
              "storageKey": null
            }
          ],
          "type": "Query",
          "abstractKey": null
        },
        "kind": "RelayResolver",
        "storageKey": null,
        "isOutputType": true
      }
    ]
  },
  "params": {
    "cacheID": "7644548f5ecbf090ba743348a54f5833",
    "id": null,
    "metadata": {},
    "name": "ResolverGCTestLiveWithRootFragmentQuery",
    "operationKind": "query",
    "text": "query ResolverGCTestLiveWithRootFragmentQuery {\n  ...LiveCounterResolver\n}\n\nfragment LiveCounterResolver on Query {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "d570bae0b297f13d75a9a78a1593f0d2";
}

module.exports = ((node/*: any*/)/*: Query<
  ResolverGCTestLiveWithRootFragmentQuery$variables,
  ResolverGCTestLiveWithRootFragmentQuery$data,
>*/);
