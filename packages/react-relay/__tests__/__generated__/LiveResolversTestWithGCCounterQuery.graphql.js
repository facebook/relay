/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fa3ecd52445d484fb9b46f1dcf3f2326>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import {counter_no_fragment as queryCounterNoFragmentResolverType} from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterNoFragment.js";
// Type assertion validating that `queryCounterNoFragmentResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterNoFragmentResolverType: () => LiveState<?mixed>);
export type LiveResolversTestWithGCCounterQuery$variables = {||};
export type LiveResolversTestWithGCCounterQuery$data = {|
  +counter_no_fragment: ?ReturnType<ReturnType<typeof queryCounterNoFragmentResolverType>["read"]>,
|};
export type LiveResolversTestWithGCCounterQuery = {|
  response: LiveResolversTestWithGCCounterQuery$data,
  variables: LiveResolversTestWithGCCounterQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTestWithGCCounterQuery",
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
    "name": "LiveResolversTestWithGCCounterQuery",
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
    "cacheID": "808e3eb8727818a6227ed8ffc08d62d4",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestWithGCCounterQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "d5f3f474e332e781cf2651a9993722bb";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTestWithGCCounterQuery$variables,
  LiveResolversTestWithGCCounterQuery$data,
>*/);
