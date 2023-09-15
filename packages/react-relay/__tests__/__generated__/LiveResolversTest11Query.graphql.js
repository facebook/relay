/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a9e2e153fcd2eb6e66bdf436ad629bf0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import {counter_no_fragment as queryCounterNoFragmentResolverType} from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterNoFragment.js";
// Type assertion validating that `queryCounterNoFragmentResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterNoFragmentResolverType: () => LiveState<?mixed>);
export type LiveResolversTest11Query$variables = {||};
export type LiveResolversTest11Query$data = {|
  +counter_no_fragment: ?ReturnType<ReturnType<typeof queryCounterNoFragmentResolverType>["read"]>,
|};
export type LiveResolversTest11Query = {|
  response: LiveResolversTest11Query$data,
  variables: LiveResolversTest11Query$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTest11Query",
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
            "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/LiveCounterNoFragment').counter_no_fragment,
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
    "name": "LiveResolversTest11Query",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "counter_no_fragment",
            "args": null,
            "fragment": null,
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": false
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "ff28203848f7e649064a20f5ebedf27a",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest11Query",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "31cc74cf61a3f60989818a57fb2b57e9";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTest11Query$variables,
  LiveResolversTest11Query$data,
>*/);
