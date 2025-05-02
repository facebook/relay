/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<65bf29cfa8527bcc637dab5296140227>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import {counter_no_fragment as queryCounterNoFragmentResolverType} from "../resolvers/LiveCounterNoFragment.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryCounterNoFragmentResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterNoFragmentResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
export type RelayReferenceMarkerTestResolverWithNoFragmentQuery$variables = {||};
export type RelayReferenceMarkerTestResolverWithNoFragmentQuery$data = {|
  +counter_no_fragment: ?number,
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
            "resolverModule": require('../resolvers/LiveCounterNoFragment').counter_no_fragment,
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
            "isOutputType": true
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
