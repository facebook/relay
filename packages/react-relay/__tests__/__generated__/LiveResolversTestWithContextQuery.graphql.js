/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1e9947dd69785c5b415a9173cb9c2e08>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import {hello_world_with_context as queryHelloWorldWithContextResolverType} from "../../../relay-runtime/store/__tests__/resolvers/HelloWorldResolverWithContext.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryHelloWorldWithContextResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryHelloWorldWithContextResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?string>);
export type LiveResolversTestWithContextQuery$variables = {||};
export type LiveResolversTestWithContextQuery$data = {|
  +hello_world_with_context: ?string,
|};
export type LiveResolversTestWithContextQuery = {|
  response: LiveResolversTestWithContextQuery$data,
  variables: LiveResolversTestWithContextQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTestWithContextQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": null,
            "kind": "RelayLiveResolver",
            "name": "hello_world_with_context",
            "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/HelloWorldResolverWithContext').hello_world_with_context,
            "path": "hello_world_with_context"
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
    "name": "LiveResolversTestWithContextQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "hello_world_with_context",
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
    "cacheID": "f33438240992b128ec86e5a7fd06d163",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestWithContextQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "b6d2dfb71c75211bce2dab4922274368";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTestWithContextQuery$variables,
  LiveResolversTestWithContextQuery$data,
>*/);
