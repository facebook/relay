/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<316c00a52028b81aa2561fd8629abf18>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { EmptyCheckerTestDeferFragment$fragmentType } from "./EmptyCheckerTestDeferFragment.graphql";
export type EmptyCheckerTestDeferQuery$variables = {||};
export type EmptyCheckerTestDeferQuery$data = {|
  +$fragmentSpreads: EmptyCheckerTestDeferFragment$fragmentType,
|};
export type EmptyCheckerTestDeferQuery = {|
  response: EmptyCheckerTestDeferQuery$data,
  variables: EmptyCheckerTestDeferQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "EmptyCheckerTestDeferQuery",
    "selections": [
      {
        "kind": "Defer",
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "EmptyCheckerTestDeferFragment"
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
    "name": "EmptyCheckerTestDeferQuery",
    "selections": [
      {
        "if": null,
        "kind": "Defer",
        "label": "EmptyCheckerTestDeferQuery$defer$EmptyCheckerTestDeferFragment",
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
              }
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "4792b459ed1a386b84f17b4c1daf5374",
    "id": null,
    "metadata": {},
    "name": "EmptyCheckerTestDeferQuery",
    "operationKind": "query",
    "text": "query EmptyCheckerTestDeferQuery {\n  ...EmptyCheckerTestDeferFragment @defer(label: \"EmptyCheckerTestDeferQuery$defer$EmptyCheckerTestDeferFragment\")\n}\n\nfragment EmptyCheckerTestDeferFragment on Query {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "b74bcfc5714791e425ff6da02e3fb624";
}

module.exports = ((node/*: any*/)/*: Query<
  EmptyCheckerTestDeferQuery$variables,
  EmptyCheckerTestDeferQuery$data,
>*/);
