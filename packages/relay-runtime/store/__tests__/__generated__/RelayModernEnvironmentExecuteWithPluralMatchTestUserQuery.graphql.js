/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<87a2672a7cd11493baca5c62cbd23fa2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery.node.nameRenderers {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":true}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$fragmentType = any;
type RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$fragmentType = any;
export type RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithPluralMatchTestUserQueryVariables = RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery$variables;
export type RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery$data = {|
  +node: ?{|
    +nameRenderers?: ?$ReadOnlyArray<?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$fragmentType & RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$fragmentType,
    |}>,
  |},
|};
export type RelayModernEnvironmentExecuteWithPluralMatchTestUserQueryResponse = RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery$data;
export type RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery = {|
  variables: RelayModernEnvironmentExecuteWithPluralMatchTestUserQueryVariables,
  response: RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery$data,
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
      "PlainUserNameRenderer",
      "MarkdownUserNameRenderer"
    ]
  }
],
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery",
      "fragmentName": "RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
},
v4 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery",
      "fragmentName": "RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
},
v5 = {
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
    "name": "RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery",
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
                "args": (v2/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderers",
                "plural": true,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/)
                ],
                "storageKey": "nameRenderers(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
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
    "name": "RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v2/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderers",
                "plural": true,
                "selections": [
                  (v5/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/)
                ],
                "storageKey": "nameRenderers(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
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
    "cacheID": "2f2f487c79940398dd302db6b426a423",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      nameRenderers(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n        __typename\n        ... on PlainUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery: js(module: \"RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery.node.nameRenderers\")\n          __module_component_RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery.node.nameRenderers\")\n        }\n        ... on MarkdownUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery: js(module: \"RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery.node.nameRenderers\")\n          __module_component_RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery.node.nameRenderers\")\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5ba0549be6b9d3358f8bc52844e64484";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery$variables,
  RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery$data,
>*/);
