/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<40867bd16000c9478a47acebc6effcc5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$fragmentType = any;
export type RelayModernEnvironmentExecuteWithStreamTestFeedbackQuery$variables = {|
  id: string,
  enableStream: boolean,
|};
export type RelayModernEnvironmentExecuteWithStreamTestFeedbackQueryVariables = RelayModernEnvironmentExecuteWithStreamTestFeedbackQuery$variables;
export type RelayModernEnvironmentExecuteWithStreamTestFeedbackQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteWithStreamTestFeedbackQueryResponse = RelayModernEnvironmentExecuteWithStreamTestFeedbackQuery$data;
export type RelayModernEnvironmentExecuteWithStreamTestFeedbackQuery = {|
  variables: RelayModernEnvironmentExecuteWithStreamTestFeedbackQueryVariables,
  response: RelayModernEnvironmentExecuteWithStreamTestFeedbackQuery$data,
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
    "name": "RelayModernEnvironmentExecuteWithStreamTestFeedbackQuery",
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
            "name": "RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment"
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
    "name": "RelayModernEnvironmentExecuteWithStreamTestFeedbackQuery",
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
                "label": "RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$stream$actors",
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
    "cacheID": "8549fa8f21676228c46e3126d84f45cb",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithStreamTestFeedbackQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithStreamTestFeedbackQuery(\n  $id: ID!\n  $enableStream: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment on Feedback {\n  id\n  actors @stream(label: \"RelayModernEnvironmentExecuteWithStreamTestFeedbackFragment$stream$actors\", if: $enableStream, initial_count: 0) {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "91e0270ce8d4cdca76615d176c0e0c7c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithStreamTestFeedbackQuery$variables,
  RelayModernEnvironmentExecuteWithStreamTestFeedbackQuery$data,
>*/);
