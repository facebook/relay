/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0a284c6680cc485e7f43f0196a7eada4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery.node.outerRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$fragmentType = any;
export type RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithNestedMatchTestUserQueryVariables = RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery$variables;
export type RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery$data = {|
  +node: ?{|
    +outerRenderer?: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$fragmentType,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteWithNestedMatchTestUserQueryResponse = RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery$data;
export type RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery = {|
  variables: RelayModernEnvironmentExecuteWithNestedMatchTestUserQueryVariables,
  response: RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery$data,
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
v2 = [
  {
    "kind": "Literal",
    "name": "supported",
    "value": [
      "MarkdownUserNameRenderer"
    ]
  }
],
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery",
      "fragmentName": "RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
},
v4 = {
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
    "name": "RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery",
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
                "alias": "outerRenderer",
                "args": (v2/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderer",
                "plural": false,
                "selections": [
                  (v3/*: any*/)
                ],
                "storageKey": "nameRenderer(supported:[\"MarkdownUserNameRenderer\"])"
              }
            ],
            "type": "User",
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
    "name": "RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": "outerRenderer",
                "args": (v2/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderer",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": "nameRenderer(supported:[\"MarkdownUserNameRenderer\"])"
              }
            ],
            "type": "User",
            "abstractKey": null
          },
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
  },
  "params": {
    "cacheID": "349f574391c30c6c6994c81e54caa8c9",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      outerRenderer: nameRenderer(supported: [\"MarkdownUserNameRenderer\"]) {\n        __typename\n        ... on MarkdownUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery: js(module: \"RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery.node.outerRenderer\")\n          __module_component_RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery.node.outerRenderer\")\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  data {\n    markup\n    id\n  }\n  user {\n    innerRenderer: nameRenderer(supported: [\"PlainUserNameRenderer\"]) {\n      __typename\n      ... on PlainUserNameRenderer {\n        ...RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name\n        __module_operation_RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name: js(module: \"RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name.user.innerRenderer\")\n        __module_component_RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithNestedMatchTestMarkdownUserNameRenderer_name.user.innerRenderer\")\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d453d85e2370e80016d83f0f2969676d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery$variables,
  RelayModernEnvironmentExecuteWithNestedMatchTestUserQuery$data,
>*/);
