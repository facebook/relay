/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<30c863335fc36186c9a5448b91b55ce5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import {hello as queryHelloResolverType} from "../../../relay-runtime/store/__tests__/resolvers/HelloWorldResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryHelloResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryHelloResolverType: (
  args: {|
    world: string,
  |},
  context: TestResolverContextType,
) => ?string);
export type ClientOnlyQueriesTest2Query$variables = {||};
export type ClientOnlyQueriesTest2Query$data = {|
  +hello: ?string,
|};
export type ClientOnlyQueriesTest2Query = {|
  response: ClientOnlyQueriesTest2Query$data,
  variables: ClientOnlyQueriesTest2Query$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "world",
    "value": "World"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ClientOnlyQueriesTest2Query",
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
            "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/HelloWorldResolver').hello,
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
    "name": "ClientOnlyQueriesTest2Query",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "hello",
            "args": (v0/*: any*/),
            "fragment": null,
            "kind": "RelayResolver",
            "storageKey": "hello(world:\"World\")",
            "isOutputType": true
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "9db9f9cb546151c1f888e0e64e9d23b4",
    "id": null,
    "metadata": {},
    "name": "ClientOnlyQueriesTest2Query",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "42a67a5a5af91776ffbd2e05505b5001";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  ClientOnlyQueriesTest2Query$variables,
  ClientOnlyQueriesTest2Query$data,
>*/);
