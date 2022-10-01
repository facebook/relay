/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8ec4d687986fa3243f5ec3e240eb2154>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import type { LiveCounterResolver$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/LiveCounterResolver.graphql";
import queryCounterResolver from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterResolver.js";
// Type assertion validating that `queryCounterResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterResolver: (
  rootKey: LiveCounterResolver$key, 
) => LiveState<any>);
export type LiveResolversTestOptimisticUpdateQuery$variables = {||};
export type LiveResolversTestOptimisticUpdateQuery$data = {|
  +counter: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof queryCounterResolver>["read"]>,
|};
export type LiveResolversTestOptimisticUpdateQuery = {|
  response: LiveResolversTestOptimisticUpdateQuery$data,
  variables: LiveResolversTestOptimisticUpdateQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTestOptimisticUpdateQuery",
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
        "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/LiveCounterResolver'),
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
    "name": "LiveResolversTestOptimisticUpdateQuery",
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "56a21042d7b6663edd4c2e986841efb2",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestOptimisticUpdateQuery",
    "operationKind": "query",
    "text": "query LiveResolversTestOptimisticUpdateQuery {\n  ...LiveCounterResolver\n}\n\nfragment LiveCounterResolver on Query {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "cef43fd1dc9ab3a4deb198c502d706ad";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTestOptimisticUpdateQuery$variables,
  LiveResolversTestOptimisticUpdateQuery$data,
>*/);
