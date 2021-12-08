/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<db2084c0dc100f2ca09ac7e5c981fb4f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery.node.author {"branches":{"User":{"component":"FeedbackAuthor.react","fragment":"RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$fragmentType = any;
export type RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQueryVariables = RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery$variables;
export type RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery$data = {|
  +node: ?{|
    +author?: ?{|
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$fragmentType,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQueryResponse = RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery$data;
export type RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery = {|
  variables: RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQueryVariables,
  response: RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery$data,
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
  "args": null,
  "documentName": "RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery",
  "fragmentName": "RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author",
  "fragmentPropName": "author",
  "kind": "ModuleImport"
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Feedback",
            "abstractKey": null
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
    "name": "RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Feedback",
            "abstractKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "111af0fec1bde7b42c50cb3202a6411f",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on Feedback {\n      author {\n        ...RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author\n        __module_operation_RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery: js(module: \"RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery.node.author\")\n        __module_component_RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery: js(module: \"FeedbackAuthor.react\", id: \"RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery.node.author\")\n        id\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fc35da25e33ae49daa5c875e64b62542";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery$variables,
  RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery$data,
>*/);
