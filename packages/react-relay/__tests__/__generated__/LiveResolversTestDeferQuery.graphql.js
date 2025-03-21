/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<87df34e52623f9638b06152e37b9591c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { LiveResolversTestDeferFragment$fragmentType } from "./LiveResolversTestDeferFragment.graphql";
export type LiveResolversTestDeferQuery$variables = {||};
export type LiveResolversTestDeferQuery$data = {|
  +$fragmentSpreads: LiveResolversTestDeferFragment$fragmentType,
|};
export type LiveResolversTestDeferQuery = {|
  response: LiveResolversTestDeferQuery$data,
  variables: LiveResolversTestDeferQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTestDeferQuery",
    "selections": [
      {
        "kind": "Defer",
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "LiveResolversTestDeferFragment"
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
    "name": "LiveResolversTestDeferQuery",
    "selections": [
      {
        "if": null,
        "kind": "Defer",
        "label": "LiveResolversTestDeferQuery$defer$LiveResolversTestDeferFragment",
        "selections": [
          {
            "name": "counter_suspends_when_odd",
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
      }
    ]
  },
  "params": {
    "cacheID": "3d21f7198375d03268b15f6dd226cffd",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestDeferQuery",
    "operationKind": "query",
    "text": "query LiveResolversTestDeferQuery {\n  ...LiveResolversTestDeferFragment @defer(label: \"LiveResolversTestDeferQuery$defer$LiveResolversTestDeferFragment\")\n}\n\nfragment CounterSuspendsWhenOdd on Query {\n  me {\n    id\n  }\n}\n\nfragment LiveResolversTestDeferFragment on Query {\n  ...CounterSuspendsWhenOdd\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "ae82e55c303b6b124964901fdf647b8a";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTestDeferQuery$variables,
  LiveResolversTestDeferQuery$data,
>*/);
