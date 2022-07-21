/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1373afea7f8ee7f74af6e08f44521c2f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
type LiveCounterResolver$key = any;
import queryCounterResolver from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterResolver.js";
// Type assertion validating that `queryCounterResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterResolver: (
  rootKey: LiveCounterResolver$key, 
) => LiveState<any>);
export type LiveResolversTest1Query$variables = {||};
export type LiveResolversTest1Query$data = {|
  +counter: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof queryCounterResolver>["read"]>,
|};
export type LiveResolversTest1Query = {|
  response: LiveResolversTest1Query$data,
  variables: LiveResolversTest1Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTest1Query",
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
    "name": "LiveResolversTest1Query",
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
    ]
  },
  "params": {
    "cacheID": "470a7c7943805295cfa3a09c0d177903",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest1Query",
    "operationKind": "query",
    "text": "query LiveResolversTest1Query {\n  ...LiveCounterResolver\n}\n\nfragment LiveCounterResolver on Query {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "cc35115832685e80cc5a15efb288015a";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTest1Query$variables,
  LiveResolversTest1Query$data,
>*/);
