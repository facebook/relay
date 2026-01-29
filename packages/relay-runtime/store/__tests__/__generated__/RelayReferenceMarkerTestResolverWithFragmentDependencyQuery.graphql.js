/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b11f6d9c9d37c75c6a3184e3492076d4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import type { LiveCounterResolver$key } from "./../resolvers/__generated__/LiveCounterResolver.graphql";
import {counter as queryCounterResolverType} from "../resolvers/LiveCounterResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryCounterResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterResolverType: (
  rootKey: LiveCounterResolver$key,
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
export type RelayReferenceMarkerTestResolverWithFragmentDependencyQuery$variables = {||};
export type RelayReferenceMarkerTestResolverWithFragmentDependencyQuery$data = {|
  +counter: ?number,
|};
export type RelayReferenceMarkerTestResolverWithFragmentDependencyQuery = {|
  response: RelayReferenceMarkerTestResolverWithFragmentDependencyQuery$data,
  variables: RelayReferenceMarkerTestResolverWithFragmentDependencyQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReferenceMarkerTestResolverWithFragmentDependencyQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "LiveCounterResolver"
        },
        "kind": "RelayLiveResolver",
        "name": "counter",
        "resolverModule": require('../resolvers/LiveCounterResolver').counter,
        "path": "counter"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReferenceMarkerTestResolverWithFragmentDependencyQuery",
    "selections": [
      {
        "name": "counter",
        "args": null,
        "fragment": {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "me",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "id",
                  "storageKey": null
                },
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
              ],
              "storageKey": null
            }
          ],
          "type": "Query",
          "abstractKey": null
        },
        "kind": "RelayResolver",
        "storageKey": null,
        "isOutputType": true
      }
    ]
  },
  "params": {
    "cacheID": "84afc78e18bb67a57072603b0993c2cc",
    "id": null,
    "metadata": {},
    "name": "RelayReferenceMarkerTestResolverWithFragmentDependencyQuery",
    "operationKind": "query",
    "text": "query RelayReferenceMarkerTestResolverWithFragmentDependencyQuery {\n  ...LiveCounterResolver\n}\n\nfragment LiveCounterResolver on Query {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "7767fab563f2411651b1b4bf2273b512";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReferenceMarkerTestResolverWithFragmentDependencyQuery$variables,
  RelayReferenceMarkerTestResolverWithFragmentDependencyQuery$data,
>*/);
