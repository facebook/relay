/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9d6873325f05214bcecfbd4ca83c858f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import {hello as queryHelloResolverType} from "../HelloWorldResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryHelloResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryHelloResolverType: (
  args: {|
    world: string,
  |},
  context: TestResolverContextType,
) => ?string);
export type ResolverGCTestNoFragmentStaticArgsQuery$variables = {||};
export type ResolverGCTestNoFragmentStaticArgsQuery$data = {|
  +hello: ?string,
|};
export type ResolverGCTestNoFragmentStaticArgsQuery = {|
  response: ResolverGCTestNoFragmentStaticArgsQuery$data,
  variables: ResolverGCTestNoFragmentStaticArgsQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "world",
    "value": "Planet"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResolverGCTestNoFragmentStaticArgsQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": (v0/*: any*/),
            "fragment": null,
            "kind": "RelayResolver",
            "name": "hello",
            "resolverModule": require('../HelloWorldResolver').hello,
            "path": "hello"
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
    "name": "ResolverGCTestNoFragmentStaticArgsQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "hello",
            "args": (v0/*: any*/),
            "fragment": null,
            "kind": "RelayResolver",
            "storageKey": "hello(world:\"Planet\")",
            "isOutputType": true
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "03199568c90d760c28b56eff0df3b103",
    "id": null,
    "metadata": {},
    "name": "ResolverGCTestNoFragmentStaticArgsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9b9ee1ef7e082bd557894d841c4a08f3";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  ResolverGCTestNoFragmentStaticArgsQuery$variables,
  ResolverGCTestNoFragmentStaticArgsQuery$data,
>*/);
