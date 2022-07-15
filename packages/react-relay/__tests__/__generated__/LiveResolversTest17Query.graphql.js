/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4fcc14df86774e83d125e4f236b471da>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import queryNonLiveResolverWithLiveReturnValueResolver from "../../../relay-runtime/store/__tests__/resolvers/QueryNonLiveResolverWithLiveReturnValue.js";
// Type assertion validating that `queryNonLiveResolverWithLiveReturnValueResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryNonLiveResolverWithLiveReturnValueResolver: () => mixed);
export type LiveResolversTest17Query$variables = {||};
export type LiveResolversTest17Query$data = {|
  +non_live_resolver_with_live_return_value: ?$Call<<R>((...empty[]) => R) => R, typeof queryNonLiveResolverWithLiveReturnValueResolver>,
|};
export type LiveResolversTest17Query = {|
  response: LiveResolversTest17Query$data,
  variables: LiveResolversTest17Query$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTest17Query",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": null,
            "kind": "RelayResolver",
            "name": "non_live_resolver_with_live_return_value",
            "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/QueryNonLiveResolverWithLiveReturnValue'),
            "path": "non_live_resolver_with_live_return_value"
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
    "name": "LiveResolversTest17Query",
    "selections": [
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
    ]
  },
  "params": {
    "cacheID": "45aad32a1b278b9adda1ecfa295978e3",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest17Query",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "c77a95b61ab9f2b3662fa17bf4001bfc";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTest17Query$variables,
  LiveResolversTest17Query$data,
>*/);
