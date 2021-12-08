/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5e1136c4053864a21ab0cd6e7a3231b3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery.node.outerRendererA {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$normalization.graphql"}},"plural":false}
// @dataDrivenDependency RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery.node.outerRendererB {"branches":{"PlainUserNameRenderer":{"component":"PlainTextUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$fragmentType = any;
type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$fragmentType = any;
export type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQueryVariables = RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery$variables;
export type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery$data = {|
  +node: ?{|
    +outerRendererA?: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$fragmentType,
    |},
    +outerRendererB?: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$fragmentType,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQueryResponse = RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery$data;
export type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery = {|
  variables: RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQueryVariables,
  response: RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery$data,
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
      "documentName": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererA",
      "fragmentName": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
},
v4 = [
  {
    "kind": "Literal",
    "name": "supported",
    "value": [
      "PlainUserNameRenderer"
    ]
  }
],
v5 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererB",
      "fragmentName": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
},
v6 = {
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
    "name": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery",
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
                "alias": "outerRendererA",
                "args": (v2/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderer",
                "plural": false,
                "selections": [
                  (v3/*: any*/)
                ],
                "storageKey": "nameRenderer(supported:[\"MarkdownUserNameRenderer\"])"
              },
              {
                "alias": "outerRendererB",
                "args": (v4/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderer",
                "plural": false,
                "selections": [
                  (v5/*: any*/)
                ],
                "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\"])"
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
    "name": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": "outerRendererA",
                "args": (v2/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderer",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": "nameRenderer(supported:[\"MarkdownUserNameRenderer\"])"
              },
              {
                "alias": "outerRendererB",
                "args": (v4/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderer",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  (v5/*: any*/)
                ],
                "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\"])"
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
    "cacheID": "6842f1c0bf18acb8addf48db4c172064",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      outerRendererA: nameRenderer(supported: [\"MarkdownUserNameRenderer\"]) {\n        __typename\n        ... on MarkdownUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererA: js(module: \"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery.node.outerRendererA\")\n          __module_component_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererA: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery.node.outerRendererA\")\n        }\n      }\n      outerRendererB: nameRenderer(supported: [\"PlainUserNameRenderer\"]) {\n        __typename\n        ... on PlainUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererB: js(module: \"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery.node.outerRendererB\")\n          __module_component_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererB: js(module: \"PlainTextUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery.node.outerRendererB\")\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  user {\n    name\n    innerRenderer: nameRenderer {\n      __typename\n      ... on PlainUserNameRenderer {\n        ...RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name\n        __module_operation_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name: js(module: \"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name.user.innerRenderer\")\n        __module_component_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name.user.innerRenderer\")\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  data {\n    text\n    id\n  }\n  user {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a3fcd2161f88d8217243730132ccda42";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery$variables,
  RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery$data,
>*/);
