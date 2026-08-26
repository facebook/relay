/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ee5d6670b67a8464591ef37376fe5f9e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment$fragmentType } from "./RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment.graphql";
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery$variables = {};
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery$data = {
  readonly viewer: ?{
    readonly isFbEmployee: ?boolean,
  },
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment$fragmentType,
};
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery = {
  response: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery$data,
  variables: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery$variables,
};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "concreteType": "Viewer",
  "kind": "LinkedField",
  "name": "viewer",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isFbEmployee",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery",
    "selections": [
      (v0/*:: as any*/),
      {
        "kind": "Defer",
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment"
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
    "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery",
    "selections": [
      (v0/*:: as any*/),
      {
        "if": null,
        "kind": "Defer",
        "label": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery$defer$RootFragment",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Viewer",
            "kind": "LinkedField",
            "name": "viewer",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "primaryEmail",
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
    "cacheID": "09dde3bc7c5eba826521539c5deb5184",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery {\n  viewer {\n    isFbEmployee\n  }\n  ...RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment @defer(label: \"RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery$defer$RootFragment\")\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment on Query {\n  viewer {\n    primaryEmail\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "4b646756d93e0b5f2d4df6a36ac0dc2b";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery$variables,
  RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery$data,
>*/);
