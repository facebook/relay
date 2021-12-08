/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fa5247aa47a664a561a8c9823385b4c4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithModuleTestUserQuery.node.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name$fragmentType = any;
type RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$fragmentType = any;
export type RelayModernEnvironmentExecuteWithModuleTestUserQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithModuleTestUserQueryVariables = RelayModernEnvironmentExecuteWithModuleTestUserQuery$variables;
export type RelayModernEnvironmentExecuteWithModuleTestUserQuery$data = {|
  +node: ?{|
    +nameRenderer?: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$fragmentType & RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name$fragmentType,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteWithModuleTestUserQueryResponse = RelayModernEnvironmentExecuteWithModuleTestUserQuery$data;
export type RelayModernEnvironmentExecuteWithModuleTestUserQuery = {|
  variables: RelayModernEnvironmentExecuteWithModuleTestUserQueryVariables,
  response: RelayModernEnvironmentExecuteWithModuleTestUserQuery$data,
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
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayModernEnvironmentExecuteWithModuleTestUserQuery",
      "fragmentName": "RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
},
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayModernEnvironmentExecuteWithModuleTestUserQuery",
      "fragmentName": "RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name",
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
    "name": "RelayModernEnvironmentExecuteWithModuleTestUserQuery",
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
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderer",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
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
    "name": "RelayModernEnvironmentExecuteWithModuleTestUserQuery",
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
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderer",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
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
    "cacheID": "064cee51805172bd8bf2681a127f0c41",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithModuleTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithModuleTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      nameRenderer {\n        __typename\n        ... on PlainUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithModuleTestUserQuery: js(module: \"RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithModuleTestUserQuery.node.nameRenderer\")\n          __module_component_RelayModernEnvironmentExecuteWithModuleTestUserQuery: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithModuleTestUserQuery.node.nameRenderer\")\n        }\n        ... on MarkdownUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithModuleTestUserQuery: js(module: \"RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithModuleTestUserQuery.node.nameRenderer\")\n          __module_component_RelayModernEnvironmentExecuteWithModuleTestUserQuery: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithModuleTestUserQuery.node.nameRenderer\")\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f7e3296614af262229d75d7247494862";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithModuleTestUserQuery$variables,
  RelayModernEnvironmentExecuteWithModuleTestUserQuery$data,
>*/);
