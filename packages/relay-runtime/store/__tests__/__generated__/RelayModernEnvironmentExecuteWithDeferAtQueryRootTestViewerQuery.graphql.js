/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e3650a17b41fcda06ed589381869c26e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment$fragmentType } from "./RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment.graphql";
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery$variables = {};
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery$data = {
  readonly viewer: ?{
    readonly primaryEmail: ?string,
  },
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment$fragmentType,
};
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery = {
  response: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery$data,
  variables: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery$variables,
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
      "name": "primaryEmail",
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
    "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery",
    "selections": [
      (v0/*:: as any*/),
      {
        "kind": "Defer",
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment"
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
    "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery",
    "selections": [
      (v0/*:: as any*/),
      {
        "if": null,
        "kind": "Defer",
        "label": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery$defer$ViewerFragment",
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
                "name": "isFbEmployee",
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
    "cacheID": "c7e21fd519629bd5c805d8c9f68bd5cb",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery {\n  viewer {\n    primaryEmail\n  }\n  ...RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment @defer(label: \"RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery$defer$ViewerFragment\")\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment on Query {\n  viewer {\n    isFbEmployee\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "60a7bf4c3f184e91b7daab41571e1d58";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery$variables,
  RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery$data,
>*/);
