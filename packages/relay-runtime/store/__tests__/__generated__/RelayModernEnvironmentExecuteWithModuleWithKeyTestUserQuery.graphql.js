/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8ebbdb531d7f3f8a83149a8db70b71a7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery.node.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$fragmentType } from "./RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name.graphql";
import type { RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name$fragmentType } from "./RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name.graphql";
export type RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery$data = {|
  +node: ?({|
    +__typename: "User",
    +nameRenderer: ?({|
      +__typename: "MarkdownUserNameRenderer",
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$fragmentType,
    |} | {|
      +__typename: "PlainUserNameRenderer",
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name$fragmentType,
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
export type RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery = {|
  response: RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery$data,
  variables: RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery$variables,
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
      "documentName": "RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer",
      "fragmentName": "RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name",
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
      "documentName": "RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer",
      "fragmentName": "RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name",
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery",
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
                "alias": "nameRenderer",
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRendererNoSupportedArg",
                "plural": false,
                "selections": [
                  (v2/*:: as any*/),
                  (v3/*:: as any*/)
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": "nameRenderer",
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRendererNoSupportedArg",
                "plural": false,
                "selections": [
                  (v4/*:: as any*/),
                  (v2/*:: as any*/),
                  (v3/*:: as any*/)
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
    "cacheID": "32592291870c84736a4faf98c1215622",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      nameRenderer: nameRendererNoSupportedArg {\n        __typename\n        ... on PlainUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer: js(module: \"RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery.node.nameRenderer\")\n          __module_component_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery.node.nameRenderer\")\n        }\n        ... on MarkdownUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer: js(module: \"RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery.node.nameRenderer\")\n          __module_component_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery.node.nameRenderer\")\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "12de9249571db0a1919c48b99908c2e6";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery$variables,
  RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery$data,
>*/);
