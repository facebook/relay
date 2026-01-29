/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<99f5ad9271fda6ef2e2726413f476a62>>
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
export type ResolverGCTestNoRetainedQueriesQuery$variables = {||};
export type ResolverGCTestNoRetainedQueriesQuery$data = {|
  +counter_no_fragment: ?number,
|};
export type ResolverGCTestNoRetainedQueriesQuery = {|
  response: ResolverGCTestNoRetainedQueriesQuery$data,
  variables: ResolverGCTestNoRetainedQueriesQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResolverGCTestNoRetainedQueriesQuery",
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
    "name": "ResolverGCTestNoRetainedQueriesQuery",
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
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "a5905620d7505500bf0cb987c540bc24",
    "id": null,
    "metadata": {},
    "name": "ResolverGCTestNoRetainedQueriesQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "c081f9d7220711c53528ae28f136ca80";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  ResolverGCTestNoRetainedQueriesQuery$variables,
  ResolverGCTestNoRetainedQueriesQuery$data,
>*/);
