/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4f9ac53a3b3a44031c219db7ecd25c43>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery.node.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithOverlappingModuleTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$fragmentType = any;
type RelayModernEnvironmentExecuteWithOverlappingModuleTestPlainUserNameRenderer_name$fragmentType = any;
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestQueryVariables = RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery$variables;
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery$data = {|
  +node: ?{|
    +nameRenderer?: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$fragmentType & RelayModernEnvironmentExecuteWithOverlappingModuleTestPlainUserNameRenderer_name$fragmentType,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestQueryResponse = RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery$data;
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery = {|
  variables: RelayModernEnvironmentExecuteWithOverlappingModuleTestQueryVariables,
  response: RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery$data,
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
      "documentName": "RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery",
      "fragmentName": "RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
},
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery",
      "fragmentName": "RelayModernEnvironmentExecuteWithOverlappingModuleTestPlainUserNameRenderer_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "PlainUserNameRenderer",
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
    "name": "RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery",
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
    "name": "RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery",
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
    "cacheID": "f2718e4ee5d2fafa8940ba7fba368456",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      nameRenderer {\n        __typename\n        ... on MarkdownUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery: js(module: \"RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery.node.nameRenderer\")\n          __module_component_RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery.node.nameRenderer\")\n        }\n        ... on PlainUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithOverlappingModuleTestPlainUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery: js(module: \"RelayModernEnvironmentExecuteWithOverlappingModuleTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery.node.nameRenderer\")\n          __module_component_RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery.node.nameRenderer\")\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithOverlappingModuleTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "67220472e4a3160320bb23054988237e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery$variables,
  RelayModernEnvironmentExecuteWithOverlappingModuleTestQuery$data,
>*/);
