/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<14e6972b8b11662d005117fea8033c74>>
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
export type LiveResolversTest2Query$variables = {||};
export type LiveResolversTest2Query$data = {|
  +counter: ?number,
|};
export type LiveResolversTest2Query = {|
  response: LiveResolversTest2Query$data,
  variables: LiveResolversTest2Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTest2Query",
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
    "name": "LiveResolversTest2Query",
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
    "cacheID": "acaf05571c9f3a21b7e7f0f4557948c1",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest2Query",
    "operationKind": "query",
    "text": "query LiveResolversTest2Query {\n  ...LiveCounterResolver\n}\n\nfragment LiveCounterResolver on Query {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "617c53a6416354bceda3dfc436921fc1";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTest2Query$variables,
  LiveResolversTest2Query$data,
>*/);
