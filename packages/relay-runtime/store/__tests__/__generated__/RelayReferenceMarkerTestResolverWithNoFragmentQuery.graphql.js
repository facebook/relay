/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<277374b46b3dd42750fd447202ecab76>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import {counter_no_fragment as queryCounterNoFragmentResolverType} from "../resolvers/LiveCounterNoFragment.js";
// Type assertion validating that `queryCounterNoFragmentResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterNoFragmentResolverType: () => LiveState<?mixed>);
export type RelayReferenceMarkerTestResolverWithNoFragmentQuery$variables = {||};
export type RelayReferenceMarkerTestResolverWithNoFragmentQuery$data = {|
  +counter_no_fragment: ?ReturnType<ReturnType<typeof queryCounterNoFragmentResolverType>["read"]>,
|};
export type RelayReferenceMarkerTestResolverWithNoFragmentQuery = {|
  response: RelayReferenceMarkerTestResolverWithNoFragmentQuery$data,
  variables: RelayReferenceMarkerTestResolverWithNoFragmentQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReferenceMarkerTestResolverWithNoFragmentQuery",
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
            "resolverModule": require('./../resolvers/LiveCounterNoFragment').counter_no_fragment,
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
    "name": "RelayReferenceMarkerTestResolverWithNoFragmentQuery",
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
            "isOutputType": false
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "8c375638099ffb0ce1ae014780466c65",
    "id": null,
    "metadata": {},
    "name": "RelayReferenceMarkerTestResolverWithNoFragmentQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "5a9253445617d4109238b463c4407c5d";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayReferenceMarkerTestResolverWithNoFragmentQuery$variables,
  RelayReferenceMarkerTestResolverWithNoFragmentQuery$data,
>*/);
