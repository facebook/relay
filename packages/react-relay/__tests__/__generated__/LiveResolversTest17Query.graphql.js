/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f2c76e2ce8879246f4d8b79d768f7bae>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import {non_live_resolver_with_live_return_value as queryNonLiveResolverWithLiveReturnValueResolverType} from "../../../relay-runtime/store/__tests__/resolvers/QueryNonLiveResolverWithLiveReturnValue.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryNonLiveResolverWithLiveReturnValueResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryNonLiveResolverWithLiveReturnValueResolverType: (
  args: void,
  context: TestResolverContextType,
) => ?string);
export type LiveResolversTest17Query$variables = {||};
export type LiveResolversTest17Query$data = {|
  +non_live_resolver_with_live_return_value: ?string,
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
            "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/QueryNonLiveResolverWithLiveReturnValue').non_live_resolver_with_live_return_value,
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
            "name": "non_live_resolver_with_live_return_value",
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
