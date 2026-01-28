/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2761c3bc058a3151ac2c7632ca7f29b3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import {hello as queryHelloResolverType} from "../resolvers/HelloWorldResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryHelloResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryHelloResolverType: (
  args: {|
    world: string,
  |},
  context: TestResolverContextType,
) => ?string);
export type EmptyCheckerTestResolverNoFragmentQuery$variables = {||};
export type EmptyCheckerTestResolverNoFragmentQuery$data = {|
  +hello: ?string,
|};
export type EmptyCheckerTestResolverNoFragmentQuery = {|
  response: EmptyCheckerTestResolverNoFragmentQuery$data,
  variables: EmptyCheckerTestResolverNoFragmentQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "world",
    "value": "Test"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "EmptyCheckerTestResolverNoFragmentQuery",
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
            "resolverModule": require('../resolvers/HelloWorldResolver').hello,
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
    "name": "EmptyCheckerTestResolverNoFragmentQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "hello",
            "args": (v0/*: any*/),
            "fragment": null,
            "kind": "RelayResolver",
            "storageKey": "hello(world:\"Test\")",
            "isOutputType": true
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "4e73ded22c84c6aa0f4f64affb8545c2",
    "id": null,
    "metadata": {},
    "name": "EmptyCheckerTestResolverNoFragmentQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a5a24c34a099eacac409e84abcb30ea7";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  EmptyCheckerTestResolverNoFragmentQuery$variables,
  EmptyCheckerTestResolverNoFragmentQuery$data,
>*/);
