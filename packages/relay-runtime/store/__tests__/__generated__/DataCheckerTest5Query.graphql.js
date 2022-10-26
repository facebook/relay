/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a5c2c2c3a8d14f1d27623cda1705d235>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @indirectDataDrivenDependency DataCheckerTest5Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"DataCheckerTest5MarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"DataCheckerTest5PlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataCheckerTest5Fragment$fragmentType } from "./DataCheckerTest5Fragment.graphql";
export type DataCheckerTest5Query$variables = {|
  id: string,
|};
export type DataCheckerTest5Query$data = {|
  +node: ?{|
    +$fragmentSpreads: DataCheckerTest5Fragment$fragmentType,
  |},
|};
export type DataCheckerTest5Query = {|
  response: DataCheckerTest5Query$data,
  variables: DataCheckerTest5Query$variables,
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DataCheckerTest5Query",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "DataCheckerTest5Fragment"
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
    "name": "DataCheckerTest5Query",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
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
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "args": null,
                        "documentName": "DataCheckerTest5Fragment",
                        "fragmentName": "DataCheckerTest5PlainUserNameRenderer_name",
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
                        "documentName": "DataCheckerTest5Fragment",
                        "fragmentName": "DataCheckerTest5MarkdownUserNameRenderer_name",
                        "fragmentPropName": "name",
                        "kind": "ModuleImport"
                      }
                    ],
                    "type": "MarkdownUserNameRenderer",
                    "abstractKey": null
                  }
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
    ]
  },
  "params": {
    "cacheID": "69328aa5ce5e7ee5a3186f42658364c8",
    "id": null,
    "metadata": {},
    "name": "DataCheckerTest5Query",
    "operationKind": "query",
    "text": "query DataCheckerTest5Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...DataCheckerTest5Fragment\n    id\n  }\n}\n\nfragment DataCheckerTest5Fragment on User {\n  id\n  nameRenderer {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...DataCheckerTest5PlainUserNameRenderer_name\n      __module_operation_DataCheckerTest5Fragment: js(module: \"DataCheckerTest5PlainUserNameRenderer_name$normalization.graphql\", id: \"DataCheckerTest5Fragment.nameRenderer\")\n      __module_component_DataCheckerTest5Fragment: js(module: \"PlainUserNameRenderer.react\", id: \"DataCheckerTest5Fragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...DataCheckerTest5MarkdownUserNameRenderer_name\n      __module_operation_DataCheckerTest5Fragment: js(module: \"DataCheckerTest5MarkdownUserNameRenderer_name$normalization.graphql\", id: \"DataCheckerTest5Fragment.nameRenderer\")\n      __module_component_DataCheckerTest5Fragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"DataCheckerTest5Fragment.nameRenderer\")\n    }\n  }\n}\n\nfragment DataCheckerTest5MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment DataCheckerTest5PlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "eb95da17a46437e27a3ea0ccf845ea21";
}

module.exports = ((node/*: any*/)/*: Query<
  DataCheckerTest5Query$variables,
  DataCheckerTest5Query$data,
>*/);
