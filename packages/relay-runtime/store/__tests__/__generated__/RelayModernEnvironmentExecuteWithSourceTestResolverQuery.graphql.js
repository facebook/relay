/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c82962c49ce63e2a0cccf5b748e13150>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import {hello as queryHelloResolverType} from "../resolvers/HelloWorldResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryHelloResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryHelloResolverType as (
  args: {|
    world: string,
  |},
  context: TestResolverContextType,
) => ?string);
export type RelayModernEnvironmentExecuteWithSourceTestResolverQuery$variables = {||};
export type RelayModernEnvironmentExecuteWithSourceTestResolverQuery$data = {|
  +hello: ?string,
|};
export type RelayModernEnvironmentExecuteWithSourceTestResolverQuery = {|
  response: RelayModernEnvironmentExecuteWithSourceTestResolverQuery$data,
  variables: RelayModernEnvironmentExecuteWithSourceTestResolverQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "world",
    "value": "world"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithSourceTestResolverQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": (v0/*:: as any*/),
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
    "name": "RelayModernEnvironmentExecuteWithSourceTestResolverQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "hello",
            "args": (v0/*:: as any*/),
            "kind": "RelayResolver",
            "storageKey": "hello(world:\"world\")",
            "isOutputType": true,
            "resolverInfo": {
              "resolverFunction": require('../resolvers/HelloWorldResolver').hello,
              "rootFragment": null
            }
          }
        ]
      }
    ],
    "use_exec_time_resolvers": true
  },
  "params": {
    "cacheID": "fa443bb4f45bc8369a097ab31b869a81",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithSourceTestResolverQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "f4edc2aa49bc406ef5fc57d2d43b3cbe";
}

module.exports = ((node/*:: as any*/)/*:: as ClientQuery<
  RelayModernEnvironmentExecuteWithSourceTestResolverQuery$variables,
  RelayModernEnvironmentExecuteWithSourceTestResolverQuery$data,
>*/);
