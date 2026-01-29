/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4702a7dc75e760d382d368c54bd2f53f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import type { LiveCounterResolver$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/LiveCounterResolver.graphql";
import {counter as queryCounterResolverType} from "../../../relay-runtime/store/__tests__/resolvers/LiveCounterResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryCounterResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterResolverType: (
  rootKey: LiveCounterResolver$key,
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
export type LiveResolversTest1Query$variables = {||};
export type LiveResolversTest1Query$data = {|
  +counter: ?number,
|};
export type LiveResolversTest1Query = {|
  response: LiveResolversTest1Query$data,
  variables: LiveResolversTest1Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTest1Query",
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
        "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/LiveCounterResolver').counter,
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
    "name": "LiveResolversTest1Query",
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
    "cacheID": "470a7c7943805295cfa3a09c0d177903",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest1Query",
    "operationKind": "query",
    "text": "query LiveResolversTest1Query {\n  ...LiveCounterResolver\n}\n\nfragment LiveCounterResolver on Query {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "cc35115832685e80cc5a15efb288015a";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTest1Query$variables,
  LiveResolversTest1Query$data,
>*/);
