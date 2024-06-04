/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<db474fcee801ff60a9c1169fb2bf50dc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import {hello_context as queryHelloContextResolverType} from "../../../relay-runtime/store/__tests__/resolvers/HelloWorldContextResolver.js";
// Type assertion validating that `queryHelloContextResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryHelloContextResolverType: () => ?string);
export type ClientOnlyQueriesTestContextQuery$variables = {||};
export type ClientOnlyQueriesTestContextQuery$data = {|
  +hello_context: ?string,
|};
export type ClientOnlyQueriesTestContextQuery = {|
  response: ClientOnlyQueriesTestContextQuery$data,
  variables: ClientOnlyQueriesTestContextQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ClientOnlyQueriesTestContextQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": null,
            "kind": "RelayResolver",
            "name": "hello_context",
            "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/HelloWorldContextResolver').hello_context,
            "path": "hello_context"
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
    "name": "ClientOnlyQueriesTestContextQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "hello_context",
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
    "cacheID": "7353d131a1ea71f4c83daaa3d0fb010c",
    "id": null,
    "metadata": {},
    "name": "ClientOnlyQueriesTestContextQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "8e9bb60757d99b6086f610fd984790e8";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  ClientOnlyQueriesTestContextQuery$variables,
  ClientOnlyQueriesTestContextQuery$data,
>*/);
