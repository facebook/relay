/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<08b477d5603cbd69801c1125fae0bf86>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery.node.nameRendererForContext {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name$fragmentType = any;
type RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestPlainUserNameRenderer_name$fragmentType = any;
export type RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQueryVariables = RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery$variables;
export type RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery$data = {|
  +node: ?{|
    +nameRendererForContext?: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestPlainUserNameRenderer_name$fragmentType & RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name$fragmentType,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQueryResponse = RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery$data;
export type RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery = {|
  variables: RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQueryVariables,
  response: RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery$data,
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
    "name": "context",
    "value": "HEADER"
  },
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
      "documentName": "RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery",
      "fragmentName": "RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestPlainUserNameRenderer_name",
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
      "documentName": "RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery",
      "fragmentName": "RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name",
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
    "name": "RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery",
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
                "name": "nameRendererForContext",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/)
                ],
                "storageKey": "nameRendererForContext(context:\"HEADER\",supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
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
    "name": "RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery",
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
                "name": "nameRendererForContext",
                "plural": false,
                "selections": [
                  (v5/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/)
                ],
                "storageKey": "nameRendererForContext(context:\"HEADER\",supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
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
    "cacheID": "4ed6f59f19ca687b38575c72d192edc2",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      nameRendererForContext(context: HEADER, supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n        __typename\n        ... on PlainUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestPlainUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery: js(module: \"RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery.node.nameRendererForContext\")\n          __module_component_RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery.node.nameRendererForContext\")\n        }\n        ... on MarkdownUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery: js(module: \"RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery.node.nameRendererForContext\")\n          __module_component_RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery.node.nameRendererForContext\")\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "af24ed1b794e762b81d50cc1c51d755f";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery$variables,
  RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestUserQuery$data,
>*/);
