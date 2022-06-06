/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5f6f08164d6b4504196d583ca36ac6b3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import queryCounterNoFragmentWithArgResolver from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterNoFragmentWithArg.js";
// Type assertion validating that `queryCounterNoFragmentWithArgResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterNoFragmentWithArgResolver: (
  args: {|
    prefix: string,
  |}, 
) => mixed);
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

var node/*: ConcreteRequest*/ = (function(){
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
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "__typename",
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a305c79598f530d54e98411531e56f08",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest12Query",
    "operationKind": "query",
    "text": "query LiveResolversTest12Query {\n  __typename\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "adc337faf39c5cb202fe74905803e326";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTest12Query$variables,
  LiveResolversTest12Query$data,
>*/);
