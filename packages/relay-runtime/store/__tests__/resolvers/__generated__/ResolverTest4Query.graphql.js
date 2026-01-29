/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<482e1bf9f224d1e562feb8d57dfd9158>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import {hello_optional_world as queryHelloOptionalWorldResolverType} from "../HelloWorldOptionalResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryHelloOptionalWorldResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryHelloOptionalWorldResolverType: (
  args: {|
    world: ?string,
  |},
  context: TestResolverContextType,
) => ?string);
export type ResolverTest4Query$variables = {||};
export type ResolverTest4Query$data = {|
  +hello_optional_world: ?string,
|};
export type ResolverTest4Query = {|
  response: ResolverTest4Query$data,
  variables: ResolverTest4Query$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResolverTest4Query",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": [],
            "fragment": null,
            "kind": "RelayResolver",
            "name": "hello_optional_world",
            "resolverModule": require('../HelloWorldOptionalResolver').hello_optional_world,
            "path": "hello_optional_world"
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
    "name": "ResolverTest4Query",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "hello_optional_world",
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
    "cacheID": "92f8b77326cde6e1f67d081155d0dfc7",
    "id": null,
    "metadata": {},
    "name": "ResolverTest4Query",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "9f62459f73e4ec513cae290b387e5e13";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  ResolverTest4Query$variables,
  ResolverTest4Query$data,
>*/);
