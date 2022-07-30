/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8ad7c379f06f029d969528aee07b6903>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type LiveResolversTest6Fragment$fragmentType = any;
export type LiveResolversTest6Query$variables = {||};
export type LiveResolversTest6Query$data = {|
  +$fragmentSpreads: LiveResolversTest6Fragment$fragmentType,
|};
export type LiveResolversTest6Query = {|
  response: LiveResolversTest6Query$data,
  variables: LiveResolversTest6Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTest6Query",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "LiveResolversTest6Fragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LiveResolversTest6Query",
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
            "name": "name",
            "storageKey": null
          },
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
    "cacheID": "a632c5ad2b36fb29ec74f9a544a44a14",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest6Query",
    "operationKind": "query",
    "text": "query LiveResolversTest6Query {\n  ...LiveResolversTest6Fragment\n}\n\nfragment CounterSuspendsWhenOdd on Query {\n  me {\n    id\n  }\n}\n\nfragment LiveResolversTest6Fragment on Query {\n  ...UserNameAndCounterSuspendsWhenOdd\n}\n\nfragment UserNameAndCounterSuspendsWhenOdd on Query {\n  me {\n    name\n    id\n  }\n  ...CounterSuspendsWhenOdd\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "36648bb2cbac6fe4fecb46c1d8926b74";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTest6Query$variables,
  LiveResolversTest6Query$data,
>*/);
