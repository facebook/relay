/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<468cd1e1db4b864ff2b4a0d90eb0adbb>>
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
import {counter as queryCounterResolver} from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterResolver.js";
// Type assertion validating that `queryCounterResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterResolver: (
  rootKey: LiveCounterResolver$key, 
) => LiveState<any>);
export type LiveResolversTest2Query$variables = {||};
export type LiveResolversTest2Query$data = {|
  +counter: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof queryCounterResolver>["read"]>,
|};
export type LiveResolversTest2Query = {|
  response: LiveResolversTest2Query$data,
  variables: LiveResolversTest2Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTest2Query",
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
        "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/LiveCounterResolver').counter,
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
    "name": "LiveResolversTest2Query",
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
    "cacheID": "acaf05571c9f3a21b7e7f0f4557948c1",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest2Query",
    "operationKind": "query",
    "text": "query LiveResolversTest2Query {\n  ...LiveCounterResolver\n}\n\nfragment LiveCounterResolver on Query {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "617c53a6416354bceda3dfc436921fc1";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTest2Query$variables,
  LiveResolversTest2Query$data,
>*/);
