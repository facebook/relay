/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b31cfd5929e431f659e4067cf08b7225>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$fragmentType = any;
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQuery$variables = {|
  id: string,
  enableStream: boolean,
|};
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQueryVariables = RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQuery$variables;
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQueryResponse = RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQuery$data;
export type RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQuery = {|
  variables: RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQueryVariables,
  response: RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQuery$data,
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
    "name": "RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQuery",
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
            "name": "RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment"
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
    "name": "RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQuery",
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
                "label": "RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors",
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
                      (v4/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "filters": null,
                    "handle": "actors_handler",
                    "key": "",
                    "kind": "LinkedHandle",
                    "name": "actors"
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
    "cacheID": "c9be4c5f23d25db7556bbf07763474e6",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQuery(\n  $id: ID!\n  $enableStream: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment on Feedback {\n  id\n  actors @stream(label: \"RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors\", if: $enableStream, initial_count: 0) {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "448b460c0771d55eb7b0ec5c53bd1c59";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQuery$variables,
  RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQuery$data,
>*/);
