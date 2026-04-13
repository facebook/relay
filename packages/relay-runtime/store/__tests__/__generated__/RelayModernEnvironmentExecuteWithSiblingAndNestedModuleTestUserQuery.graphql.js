/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4b7799b01d56a51bac158aafe2fc2233>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery.node.outerRendererA {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$normalization.graphql"}},"plural":false}
// @dataDrivenDependency RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery.node.outerRendererB {"branches":{"PlainUserNameRenderer":{"component":"PlainTextUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}
// @indirectDataDrivenDependency RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name.user.innerRenderer {"branches":{"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$fragmentType } from "./RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name.graphql";
import type { RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$fragmentType } from "./RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name.graphql";
export type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery$data = {|
  +node: ?({|
    +__typename: "User",
    +outerRendererA: ?({|
      +__typename: "MarkdownUserNameRenderer",
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$fragmentType,
    |} | {|
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      +__typename: "%other",
    |}),
    +outerRendererB: ?({|
      +__typename: "PlainUserNameRenderer",
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$fragmentType,
    |} | {|
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      +__typename: "%other",
    |}),
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |}),
|};
export type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery = {|
  response: RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery$data,
  variables: RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery$variables,
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
    "value": "2aTHRe"
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
    "value": "1AwQS7"
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
                "args": (v2/*:: as any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderer",
                "plural": false,
                "selections": [
                  (v3/*:: as any*/)
                ],
                "storageKey": "nameRenderer(supported:\"2aTHRe\")"
              },
              {
                "alias": "outerRendererB",
                "args": (v4/*:: as any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderer",
                "plural": false,
                "selections": [
                  (v5/*:: as any*/)
                ],
                "storageKey": "nameRenderer(supported:\"1AwQS7\")"
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": "outerRendererA",
                "args": (v2/*:: as any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderer",
                "plural": false,
                "selections": [
                  (v6/*:: as any*/),
                  (v3/*:: as any*/)
                ],
                "storageKey": "nameRenderer(supported:\"2aTHRe\")"
              },
              {
                "alias": "outerRendererB",
                "args": (v4/*:: as any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderer",
                "plural": false,
                "selections": [
                  (v6/*:: as any*/),
                  (v5/*:: as any*/)
                ],
                "storageKey": "nameRenderer(supported:\"1AwQS7\")"
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
  (node/*:: as any*/).hash = "a3fcd2161f88d8217243730132ccda42";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery$variables,
  RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery$data,
>*/);
