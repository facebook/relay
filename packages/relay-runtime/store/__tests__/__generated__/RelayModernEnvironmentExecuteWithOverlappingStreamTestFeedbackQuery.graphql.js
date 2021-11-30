/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8f0a24e10b2a4b238acbf796bd4e2e16>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType = any;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQuery$variables = {|
  id: string,
  enableStream: boolean,
|};
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQueryVariables = RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQuery$variables;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQueryResponse = RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQuery$data;
export type RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQuery = {|
  variables: RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQueryVariables,
  response: RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQuery$data,
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
},
v5 = [
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQuery",
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
            "name": "RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment"
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
    "name": "RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQuery",
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
                "label": "RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$stream$actors",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "actors",
                    "plural": true,
                    "selections": (v5/*: any*/),
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
              },
              {
                "if": "enableStream",
                "kind": "Defer",
                "label": "RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$defer$viewedBy",
                "selections": [
                  {
                    "if": "enableStream",
                    "kind": "Stream",
                    "label": "RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$stream$viewedBy",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "viewedBy",
                        "plural": true,
                        "selections": (v5/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "filters": null,
                        "handle": "actors_handler",
                        "key": "",
                        "kind": "LinkedHandle",
                        "name": "viewedBy"
                      }
                    ]
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
    "cacheID": "0b6494333b0098c6ec4561944eebece4",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQuery(\n  $id: ID!\n  $enableStream: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment on Feedback {\n  viewedBy @stream(label: \"RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment$stream$viewedBy\", if: $enableStream, initial_count: 0) {\n    __typename\n    name\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment on Feedback {\n  id\n  actors @stream(label: \"RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$stream$actors\", if: $enableStream, initial_count: 0) {\n    __typename\n    name\n    id\n  }\n  ...RelayModernEnvironmentExecuteWithOverlappingStreamTestDeferFragment @defer(label: \"RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackFragment$defer$viewedBy\", if: $enableStream)\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f23e7dbdffffaa06c49725c9cceca25c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQuery$variables,
  RelayModernEnvironmentExecuteWithOverlappingStreamTestFeedbackQuery$data,
>*/);
