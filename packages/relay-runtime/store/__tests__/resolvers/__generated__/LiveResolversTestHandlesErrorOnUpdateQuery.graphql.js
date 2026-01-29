/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a9eae4a4cd1d8e54affbce95252de8ab>>
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
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryCounterThrowsWhenOddResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterThrowsWhenOddResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
export type LiveResolversTestHandlesErrorOnUpdateQuery$variables = {||};
export type LiveResolversTestHandlesErrorOnUpdateQuery$data = {|
  +counter_throws_when_odd: ?number,
|};
export type LiveResolversTestHandlesErrorOnUpdateQuery = {|
  response: LiveResolversTestHandlesErrorOnUpdateQuery$data,
  variables: LiveResolversTestHandlesErrorOnUpdateQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTestHandlesErrorOnUpdateQuery",
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
            "resolverModule": require('../QueryLiveResolverThrowsOnRead').counter_throws_when_odd,
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
    "name": "LiveResolversTestHandlesErrorOnUpdateQuery",
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
    "cacheID": "da6bc143a73ab417777b9f52ab85616f",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestHandlesErrorOnUpdateQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "b0fe01bebd0ba17a2b27b256f6391a2d";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTestHandlesErrorOnUpdateQuery$variables,
  LiveResolversTestHandlesErrorOnUpdateQuery$data,
>*/);
