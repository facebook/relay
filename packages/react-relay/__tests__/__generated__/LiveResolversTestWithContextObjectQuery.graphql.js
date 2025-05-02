/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1249882b07a43e9d88272854b8fc97f3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import {hello_world_with_context_object as queryHelloWorldWithContextObjectResolverType} from "../../../relay-runtime/store/__tests__/resolvers/HelloWorldResolverWithContextObject.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryHelloWorldWithContextObjectResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryHelloWorldWithContextObjectResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?string>);
export type LiveResolversTestWithContextObjectQuery$variables = {||};
export type LiveResolversTestWithContextObjectQuery$data = {|
  +hello_world_with_context_object: ?string,
|};
export type LiveResolversTestWithContextObjectQuery = {|
  response: LiveResolversTestWithContextObjectQuery$data,
  variables: LiveResolversTestWithContextObjectQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTestWithContextObjectQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": null,
            "kind": "RelayLiveResolver",
            "name": "hello_world_with_context_object",
            "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/HelloWorldResolverWithContextObject').hello_world_with_context_object,
            "path": "hello_world_with_context_object"
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
    "name": "LiveResolversTestWithContextObjectQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "hello_world_with_context_object",
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
    "cacheID": "fb5cc41437478dd471c6a0ed1f2cb7ab",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestWithContextObjectQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "9d6c1c80832bc820e39b7696f247daea";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTestWithContextObjectQuery$variables,
  LiveResolversTestWithContextObjectQuery$data,
>*/);
