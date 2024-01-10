/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2b4289691ad58384a61d41abd48c29ac>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import {counter_throws_when_odd as queryCounterThrowsWhenOddResolverType} from "../QueryLiveResolverThrowsOnRead.js";
// Type assertion validating that `queryCounterThrowsWhenOddResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterThrowsWhenOddResolverType: () => LiveState<?number>);
export type LiveResolversTestHandlesErrorOnReadQuery$variables = {||};
export type LiveResolversTestHandlesErrorOnReadQuery$data = {|
  +counter_throws_when_odd: ?number,
|};
export type LiveResolversTestHandlesErrorOnReadQuery = {|
  response: LiveResolversTestHandlesErrorOnReadQuery$data,
  variables: LiveResolversTestHandlesErrorOnReadQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTestHandlesErrorOnReadQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": null,
            "kind": "RelayLiveResolver",
            "name": "counter_throws_when_odd",
            "resolverModule": require('./../QueryLiveResolverThrowsOnRead').counter_throws_when_odd,
            "path": "counter_throws_when_odd"
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
    "name": "LiveResolversTestHandlesErrorOnReadQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "counter_throws_when_odd",
            "args": null,
            "fragment": null,
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": true
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "592ff0894b0f30b3727bc99191081c3e",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestHandlesErrorOnReadQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "47643627cf996a71e53ba0dfbbfdef54";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTestHandlesErrorOnReadQuery$variables,
  LiveResolversTestHandlesErrorOnReadQuery$data,
>*/);
