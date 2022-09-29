/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<638952d7d5ea7a45ab994fb354806f33>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import queryHelloResolver from "../HelloWorldResolver.js";
// Type assertion validating that `queryHelloResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryHelloResolver: (
  args: {|
    world: string,
  |}, 
) => mixed);
export type ResolverGCTestNoFragmentStaticArgsQuery$variables = {||};
export type ResolverGCTestNoFragmentStaticArgsQuery$data = {|
  +hello: ?$Call<<R>((...empty[]) => R) => R, typeof queryHelloResolver>,
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
            "resolverModule": require('./../HelloWorldResolver'),
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
            "storageKey": "hello(world:\"Planet\")"
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
