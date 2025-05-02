/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<05fef20d7b540ba5972bbc565d97ce97>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import {counter_no_fragment_with_arg as queryCounterNoFragmentWithArgResolverType} from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterNoFragmentWithArg.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryCounterNoFragmentWithArgResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterNoFragmentWithArgResolverType: (
  args: {|
    prefix: string,
  |},
  context: TestResolverContextType,
) => LiveState<?string>);
export type LiveResolversTest12Query$variables = {|
  prefix: string,
|};
export type LiveResolversTest12Query$data = {|
  +counter_no_fragment_with_arg: ?string,
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
],
v1 = [
  {
    "kind": "Variable",
    "name": "prefix",
    "variableName": "prefix"
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
            "args": (v1/*: any*/),
            "fragment": null,
            "kind": "RelayLiveResolver",
            "name": "counter_no_fragment_with_arg",
            "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/LiveCounterNoFragmentWithArg').counter_no_fragment_with_arg,
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
            "name": "counter_no_fragment_with_arg",
            "args": (v1/*: any*/),
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
