/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9890b27c190ced634dcf8bc0bec08b53>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery.node.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownActorNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$fragmentType } from "./RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name.graphql";
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery$data = {|
  +node: ?{|
    +nameRenderer?: ?({|
      +__typename: "MarkdownUserNameRenderer",
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$fragmentType,
    |} | {|
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      +__typename: "%other",
    |}),
  |},
|};
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery = {|
  response: RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery$data,
  variables: RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery$variables,
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
      "documentName": "RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery",
      "fragmentName": "RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name",
      "fragmentPropName": "name",
      "kind": "ModuleImport"
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
},
v3 = {
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
    "name": "RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery",
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
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nameRenderer",
                "plural": false,
                "selections": [
                  (v2/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Actor",
            "abstractKey": "__isActor"
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
    "name": "RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
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
                  (v3/*:: as any*/),
                  (v2/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Actor",
            "abstractKey": "__isActor"
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
    "cacheID": "c071ca4397cda179daf90fae9aa10012",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on Actor {\n      __isActor: __typename\n      nameRenderer {\n        __typename\n        ... on MarkdownUserNameRenderer {\n          ...RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name\n          __module_operation_RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery: js(module: \"RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery.node.nameRenderer\")\n          __module_component_RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery: js(module: \"MarkdownActorNameRenderer.react\", id: \"RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery.node.nameRenderer\")\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name on MarkdownUserNameRenderer {\n  __typename\n  markdown\n  data {\n    markup\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "5b8c5731fedef0753656577cf15d7702";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery$variables,
  RelayModernEnvironmentExecuteWithOverlappingModuleTestActorQuery$data,
>*/);
