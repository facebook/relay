/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<93600409d5ef6c9ed5607deef276872c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentNoInlineTestDeferredStreamParent$fragmentType } from "./RelayModernEnvironmentNoInlineTestDeferredStreamParent.graphql";
export type RelayModernEnvironmentNoInlineTestDeferredStreamQuery$variables = {|
  cond: boolean,
  enableStream: boolean,
|};
export type RelayModernEnvironmentNoInlineTestDeferredStreamQuery$data = {|
  +viewer: ?{|
    +$fragmentSpreads: RelayModernEnvironmentNoInlineTestDeferredStreamParent$fragmentType,
  |},
|};
export type RelayModernEnvironmentNoInlineTestDeferredStreamQuery = {|
  response: RelayModernEnvironmentNoInlineTestDeferredStreamQuery$data,
  variables: RelayModernEnvironmentNoInlineTestDeferredStreamQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cond"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "enableStream"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentNoInlineTestDeferredStreamQuery",
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
            "args": [
              {
                "kind": "Variable",
                "name": "cond",
                "variableName": "cond"
              },
              {
                "kind": "Variable",
                "name": "enableStream",
                "variableName": "enableStream"
              }
            ],
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentNoInlineTestDeferredStreamParent"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentNoInlineTestDeferredStreamQuery",
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
            "if": null,
            "kind": "Defer",
            "label": "RelayModernEnvironmentNoInlineTestDeferredStreamParent$defer$FeedFragment",
            "selections": [
              {
                "args": [
                  {
                    "kind": "Variable",
                    "name": "RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$cond",
                    "variableName": "cond"
                  },
                  {
                    "kind": "Variable",
                    "name": "RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$enableStream",
                    "variableName": "enableStream"
                  }
                ],
                "fragment": require('./RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$normalization.graphql'),
                "kind": "FragmentSpread"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4d0193949508eb551fb03d7063fb2890",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentNoInlineTestDeferredStreamQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentNoInlineTestDeferredStreamQuery(\n  $cond: Boolean!\n  $enableStream: Boolean!\n) {\n  viewer {\n    ...RelayModernEnvironmentNoInlineTestDeferredStreamParent_3Qhviu\n  }\n}\n\nfragment RelayModernEnvironmentNoInlineTestDeferredStreamParent_3Qhviu on Viewer {\n  ...RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed_3Qhviu @defer(label: \"RelayModernEnvironmentNoInlineTestDeferredStreamParent$defer$FeedFragment\")\n}\n\nfragment RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed_3Qhviu on Viewer {\n  newsFeed(first: 2) {\n    edges @stream(label: \"RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$stream$newsFeed\", if: $enableStream, initialCount: 0) {\n      node {\n        __typename\n        __isFeedUnit: __typename @include(if: $cond)\n        feedback @include(if: $cond) {\n          author {\n            name\n            id\n          }\n          id\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "68954072ef7efb3ebc3914738569243c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentNoInlineTestDeferredStreamQuery$variables,
  RelayModernEnvironmentNoInlineTestDeferredStreamQuery$data,
>*/);
