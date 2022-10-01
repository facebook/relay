/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d5bf20739044eb4a05c28e31d5a40da8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import queryCounterNoFragmentResolver from "../LiveCounterNoFragment.js";
// Type assertion validating that `queryCounterNoFragmentResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterNoFragmentResolver: () => LiveState<any>);
export type ResolverGCTestWithoutFragmentQuery$variables = {||};
export type ResolverGCTestWithoutFragmentQuery$data = {|
  +counter_no_fragment: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof queryCounterNoFragmentResolver>["read"]>,
|};
export type ResolverGCTestWithoutFragmentQuery = {|
  response: ResolverGCTestWithoutFragmentQuery$data,
  variables: ResolverGCTestWithoutFragmentQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResolverGCTestWithoutFragmentQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": null,
            "kind": "RelayLiveResolver",
            "name": "counter_no_fragment",
            "resolverModule": require('./../LiveCounterNoFragment'),
            "path": "counter_no_fragment"
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ResolverGCTestWithoutFragmentQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "counter_no_fragment",
            "args": null,
            "fragment": null,
            "kind": "RelayResolver",
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "49f42f9852c17b4a9670c1d1e74b391c",
    "id": null,
    "metadata": {},
    "name": "ResolverGCTestWithoutFragmentQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "516ead6979415176350fc87c03a6e4c3";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  ResolverGCTestWithoutFragmentQuery$variables,
  ResolverGCTestWithoutFragmentQuery$data,
>*/);
