/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<63e044290b65a580283f699c8952f0fb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import {counter_no_fragment as queryCounterNoFragmentResolverType} from "../LiveCounterNoFragment.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryCounterNoFragmentResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterNoFragmentResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
import {counter_no_fragment_with_arg as queryCounterNoFragmentWithArgResolverType} from "../LiveCounterNoFragmentWithArg.js";
// Type assertion validating that `queryCounterNoFragmentWithArgResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterNoFragmentWithArgResolverType: (
  args: {|
    prefix: string,
  |},
  context: TestResolverContextType,
) => LiveState<?string>);
export type LiveResolversTestBatchingQuery$variables = {||};
export type LiveResolversTestBatchingQuery$data = {|
  +counter_no_fragment: ?number,
  +counter_no_fragment_with_arg: ?string,
|};
export type LiveResolversTestBatchingQuery = {|
  response: LiveResolversTestBatchingQuery$data,
  variables: LiveResolversTestBatchingQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "prefix",
    "value": "sup"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTestBatchingQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": null,
            "kind": "RelayLiveResolver",
            "name": "counter_no_fragment",
            "resolverModule": require('../LiveCounterNoFragment').counter_no_fragment,
            "path": "counter_no_fragment"
          },
          {
            "alias": null,
            "args": (v0/*: any*/),
            "fragment": null,
            "kind": "RelayLiveResolver",
            "name": "counter_no_fragment_with_arg",
            "resolverModule": require('../LiveCounterNoFragmentWithArg').counter_no_fragment_with_arg,
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LiveResolversTestBatchingQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "counter_no_fragment",
            "args": null,
            "fragment": null,
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": true
          },
          {
            "name": "counter_no_fragment_with_arg",
            "args": (v0/*: any*/),
            "fragment": null,
            "kind": "RelayResolver",
            "storageKey": "counter_no_fragment_with_arg(prefix:\"sup\")",
            "isOutputType": true
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "d286091c8f938beb948d075c767ad6ee",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestBatchingQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8610c66cde712c9fa62ec0312041a564";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTestBatchingQuery$variables,
  LiveResolversTestBatchingQuery$data,
>*/);
