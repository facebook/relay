/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<11bd89d05ca87fb99579f93edfb1112c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithMatchTestUserQuery.node.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithMatchTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithMatchTestMarkdownUserNameRenderer_name$fragmentType = any;
type RelayModernEnvironmentExecuteWithMatchTestPlainUserNameRenderer_name$fragmentType = any;
export type RelayModernEnvironmentExecuteWithMatchTestUserQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithMatchTestUserQueryVariables = RelayModernEnvironmentExecuteWithMatchTestUserQuery$variables;
export type RelayModernEnvironmentExecuteWithMatchTestUserQuery$data = {|
  +node: ?{|
    +nameRenderer?: ?({|
      +__typename: "PlainUserNameRenderer",
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithMatchTestPlainUserNameRenderer_name$fragmentType,
    |} | {|
      +__typename: "MarkdownUserNameRenderer",
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithMatchTestMarkdownUserNameRenderer_name$fragmentType,
    |} | {|
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      +__typename: "%other",
    |}),
  |},
|};
export type RelayModernEnvironmentExecuteWithMatchTestUserQueryResponse = RelayModernEnvironmentExecuteWithMatchTestUserQuery$data;
export type RelayModernEnvironmentExecuteWithMatchTestUserQuery = {|
  variables: RelayModernEnvironmentExecuteWithMatchTestUserQueryVariables,
  response: RelayModernEnvironmentExecuteWithMatchTestUserQuery$data,
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "supported",
          "value": [
            "PlainUserNameRenderer",
            "MarkdownUserNameRenderer"
          ]
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "nameRenderer",
      "plural": false,
      "selections": [
        (v2/*: any*/),
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "args": null,
              "documentName": "RelayModernEnvironmentExecuteWithMatchTestUserQuery",
              "fragmentName": "RelayModernEnvironmentExecuteWithMatchTestPlainUserNameRenderer_name",
              "fragmentPropName": "name",
              "kind": "ModuleImport"
            }
          ],
          "type": "PlainUserNameRenderer",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "args": null,
              "documentName": "RelayModernEnvironmentExecuteWithMatchTestUserQuery",
              "fragmentName": "RelayModernEnvironmentExecuteWithMatchTestMarkdownUserNameRenderer_name",
              "fragmentPropName": "name",
              "kind": "ModuleImport"
            }
          ],
          "type": "MarkdownUserNameRenderer",
          "abstractKey": null
        }
      ],
      "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
    }
  ],
  "type": "User",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithMatchTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/)
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
    "name": "RelayModernEnvironmentExecuteWithMatchTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
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
    "cacheID": "96b16ecab89c59ed3f7bdb0d37b0a094",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithMatchTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithMatchTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n        __typename\n        ... on PlainUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithMatchTestPlainUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithMatchTestUserQuery: js(module: \"RelayModernEnvironmentExecuteWithMatchTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithMatchTestUserQuery.node.nameRenderer\")\n          __module_component_RelayModernEnvironmentExecuteWithMatchTestUserQuery: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithMatchTestUserQuery.node.nameRenderer\")\n        }\n        ... on MarkdownUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithMatchTestMarkdownUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithMatchTestUserQuery: js(module: \"RelayModernEnvironmentExecuteWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithMatchTestUserQuery.node.nameRenderer\")\n          __module_component_RelayModernEnvironmentExecuteWithMatchTestUserQuery: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithMatchTestUserQuery.node.nameRenderer\")\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithMatchTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithMatchTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "922f598c144a800d783146ff0fe0676a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithMatchTestUserQuery$variables,
  RelayModernEnvironmentExecuteWithMatchTestUserQuery$data,
>*/);
