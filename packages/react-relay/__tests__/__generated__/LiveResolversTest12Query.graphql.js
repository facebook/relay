/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<32632ff69073457129bf9e7b05e46280>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import queryCounterNoFragmentWithArgResolver from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterNoFragmentWithArg.js";
// Type assertion validating that `queryCounterNoFragmentWithArgResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterNoFragmentWithArgResolver: (
  args: {|
    prefix: string,
  |}, 
) => LiveState<any>);
export type LiveResolversTest12Query$variables = {|
  prefix: string,
|};
export type LiveResolversTest12Query$data = {|
  +counter_no_fragment_with_arg: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof queryCounterNoFragmentWithArgResolver>["read"]>,
|};
export type LiveResolversTest12Query = {|
  response: LiveResolversTest12Query$data,
  variables: LiveResolversTest12Query$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "prefix"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTest12Query",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": [
              {
                "kind": "Variable",
                "name": "prefix",
                "variableName": "prefix"
              }
            ],
            "fragment": null,
            "kind": "RelayLiveResolver",
            "name": "counter_no_fragment_with_arg",
            "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/LiveCounterNoFragmentWithArg.js'),
            "path": "counter_no_fragment_with_arg"
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "LiveResolversTest12Query",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__id",
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "2f017a79dd7aeb8cc42adff52e694db6",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest12Query",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "adc337faf39c5cb202fe74905803e326";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTest12Query$variables,
  LiveResolversTest12Query$data,
>*/);
