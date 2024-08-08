/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4340a7795217d78a823ef087b2ed0e69>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import {live_resolver_with_bad_return_value as queryLiveResolverWithBadReturnValueResolverType} from "../../../relay-runtime/store/__tests__/resolvers/QueryLiveResolverWithBadReturnValue.js";
import type { LiveResolverContextType } from "../../../relay-runtime/mutations/__tests__/LiveResolverContextType";
// Type assertion validating that `queryLiveResolverWithBadReturnValueResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryLiveResolverWithBadReturnValueResolverType: (
  _: void,
  _: void,
  context: LiveResolverContextType,
) => LiveState<?string>);
export type LiveResolversTest16Query$variables = {||};
export type LiveResolversTest16Query$data = {|
  +live_resolver_with_bad_return_value: ?string,
|};
export type LiveResolversTest16Query = {|
  response: LiveResolversTest16Query$data,
  variables: LiveResolversTest16Query$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTest16Query",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": null,
            "kind": "RelayLiveResolver",
            "name": "live_resolver_with_bad_return_value",
            "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/QueryLiveResolverWithBadReturnValue').live_resolver_with_bad_return_value,
            "path": "live_resolver_with_bad_return_value"
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
    "name": "LiveResolversTest16Query",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "live_resolver_with_bad_return_value",
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
    "cacheID": "f255cb56b711b4d192aacc8e6a11c390",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest16Query",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "e055bf3c3b415e5cd631e4011760e3f1";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTest16Query$variables,
  LiveResolversTest16Query$data,
>*/);
