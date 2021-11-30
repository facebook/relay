/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f9d88b49ba82a1a19dc867c15772980b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$fragmentType = any;
export type RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQuery$variables = {|
  id: string,
  enableStream: boolean,
|};
export type RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQueryVariables = RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQuery$variables;
export type RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQueryResponse = RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQuery$data;
export type RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQuery = {|
  variables: RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQueryVariables,
  response: RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "enableStream"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment"
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v4/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "if": "enableStream",
                "kind": "Stream",
                "label": "RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$stream$actors",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "actors",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
                        "storageKey": null
                      },
                      (v4/*: any*/)
                    ],
                    "storageKey": null
                  }
                ]
              }
            ],
            "type": "Feedback",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "46f885c5c69d3a7ec298606dd5a92049",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQuery(\n  $id: ID!\n  $enableStream: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment on Feedback {\n  id\n  actors @stream(label: \"RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment$stream$actors\", if: $enableStream, initial_count: 0) {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ab3c3dfb9f6ec864b836f85e13609fb0";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQuery$variables,
  RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQuery$data,
>*/);
