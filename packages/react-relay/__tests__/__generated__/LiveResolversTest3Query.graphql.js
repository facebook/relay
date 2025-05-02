/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4ca4681983a4310b4d6e2cbc081947b5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { CounterPlusOneResolver$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/CounterPlusOneResolver.graphql";
import {counter_plus_one as queryCounterPlusOneResolverType} from "../../../relay-runtime/store/__tests__/resolvers/CounterPlusOneResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryCounterPlusOneResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterPlusOneResolverType: (
  rootKey: CounterPlusOneResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?number);
export type LiveResolversTest3Query$variables = {||};
export type LiveResolversTest3Query$data = {|
  +counter_plus_one: ?number,
|};
export type LiveResolversTest3Query = {|
  response: LiveResolversTest3Query$data,
  variables: LiveResolversTest3Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTest3Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "CounterPlusOneResolver"
        },
        "kind": "RelayResolver",
        "name": "counter_plus_one",
        "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/CounterPlusOneResolver').counter_plus_one,
        "path": "counter_plus_one"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LiveResolversTest3Query",
    "selections": [
      {
        "name": "counter_plus_one",
        "args": null,
        "fragment": {
          "kind": "InlineFragment",
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
    "cacheID": "b2c212b3ae402a620d2e9c21c94ef02e",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest3Query",
    "operationKind": "query",
    "text": "query LiveResolversTest3Query {\n  ...CounterPlusOneResolver\n}\n\nfragment CounterPlusOneResolver on Query {\n  ...LiveCounterResolver\n}\n\nfragment LiveCounterResolver on Query {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "e394a8c589e50f3f874710a2cb10af90";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTest3Query$variables,
  LiveResolversTest3Query$data,
>*/);
