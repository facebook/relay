/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cf3129ca0b39b02814386a5dc71cd8ac>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$fragmentType = any;
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQueryVariables = RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQuery$variables;
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQueryResponse = RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQuery$data;
export type RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQuery = {|
  variables: RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQueryVariables,
  response: RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment"
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
    "name": "RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "if": null,
                "kind": "Stream",
                "label": "RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$stream$actors",
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
                      {
                        "alias": null,
                        "args": null,
                        "filters": null,
                        "handle": "name_handler",
                        "key": "",
                        "kind": "ScalarHandle",
                        "name": "name"
                      },
                      (v2/*: any*/)
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
    "cacheID": "7fb5cda3a4e6ef5690ee5e01ed28f096",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment\n  }\n}\n\nfragment RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment on Feedback {\n  id\n  actors @stream(label: \"RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackFragment$stream$actors\", initial_count: 0) {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1e9ff23e175d055a8cf9262725de7afa";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQuery$variables,
  RelayModernEnvironmentExecuteSubscriptionWithStreamTestFeedbackQuery$data,
>*/);
