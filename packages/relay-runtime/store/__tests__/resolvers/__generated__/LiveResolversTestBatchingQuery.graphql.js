/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fdf4c354c9c0d4f35860faf6060d2ae7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import {counter_no_fragment as queryCounterNoFragmentResolver} from "../LiveCounterNoFragment.js";
// Type assertion validating that `queryCounterNoFragmentResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterNoFragmentResolver: () => LiveState<any>);
import {counter_no_fragment_with_arg as queryCounterNoFragmentWithArgResolver} from "../LiveCounterNoFragmentWithArg.js";
// Type assertion validating that `queryCounterNoFragmentWithArgResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterNoFragmentWithArgResolver: (
  args: {|
    prefix: string,
  |}, 
) => LiveState<any>);
export type LiveResolversTestBatchingQuery$variables = {||};
export type LiveResolversTestBatchingQuery$data = {|
  +counter_no_fragment: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof queryCounterNoFragmentResolver>["read"]>,
  +counter_no_fragment_with_arg: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof queryCounterNoFragmentWithArgResolver>["read"]>,
|};
export type LiveResolversTestBatchingQuery = {|
  response: LiveResolversTestBatchingQuery$data,
  variables: LiveResolversTestBatchingQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "prefix",
    "value": "sup"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTestBatchingQuery",
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
            "resolverModule": require('./../LiveCounterNoFragment').counter_no_fragment,
            "path": "counter_no_fragment"
          },
          {
            "alias": null,
            "args": (v0/*: any*/),
            "fragment": null,
            "kind": "RelayLiveResolver",
            "name": "counter_no_fragment_with_arg",
            "resolverModule": require('./../LiveCounterNoFragmentWithArg').counter_no_fragment_with_arg,
            "path": "counter_no_fragment_with_arg"
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
    "name": "LiveResolversTestBatchingQuery",
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
          },
          {
            "name": "counter_no_fragment_with_arg",
            "args": (v0/*: any*/),
            "fragment": null,
            "kind": "RelayResolver",
            "storageKey": "counter_no_fragment_with_arg(prefix:\"sup\")"
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "d286091c8f938beb948d075c767ad6ee",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestBatchingQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8610c66cde712c9fa62ec0312041a564";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTestBatchingQuery$variables,
  LiveResolversTestBatchingQuery$data,
>*/);
