/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dd5662604520c0c7722a8e6bfc3d367e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type LiveResolversTest5Fragment$fragmentType = any;
export type LiveResolversTest5Query$variables = {||};
export type LiveResolversTest5Query$data = {|
  +$fragmentSpreads: LiveResolversTest5Fragment$fragmentType,
|};
export type LiveResolversTest5Query = {|
  response: LiveResolversTest5Query$data,
  variables: LiveResolversTest5Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTest5Query",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "LiveResolversTest5Fragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LiveResolversTest5Query",
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
    ]
  },
  "params": {
    "cacheID": "63a44a14e4159cb65390fd9cefa9965f",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest5Query",
    "operationKind": "query",
    "text": "query LiveResolversTest5Query {\n  ...LiveResolversTest5Fragment\n}\n\nfragment CounterSuspendsWhenOdd on Query {\n  me {\n    id\n  }\n}\n\nfragment LiveResolversTest5Fragment on Query {\n  ...CounterSuspendsWhenOdd\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "f0599062c4e513473d1b863641056cd0";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTest5Query$variables,
  LiveResolversTest5Query$data,
>*/);
