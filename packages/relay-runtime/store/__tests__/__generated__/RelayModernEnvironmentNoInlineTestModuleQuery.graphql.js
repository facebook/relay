/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6e880043814503b433cd554c68356a4b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentNoInlineTestModuleQuery.node.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$fragmentType = any;
export type RelayModernEnvironmentNoInlineTestModuleQuery$variables = {|
  cond: boolean,
|};
export type RelayModernEnvironmentNoInlineTestModuleQueryVariables = RelayModernEnvironmentNoInlineTestModuleQuery$variables;
export type RelayModernEnvironmentNoInlineTestModuleQuery$data = {|
  +node: ?{|
    +nameRenderer?: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$fragmentType,
    |},
  |},
|};
export type RelayModernEnvironmentNoInlineTestModuleQueryResponse = RelayModernEnvironmentNoInlineTestModuleQuery$data;
export type RelayModernEnvironmentNoInlineTestModuleQuery = {|
  variables: RelayModernEnvironmentNoInlineTestModuleQueryVariables,
  response: RelayModernEnvironmentNoInlineTestModuleQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cond"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "1"
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
    "name": "RelayModernEnvironmentNoInlineTestModuleQuery",
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
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "args": [
                          {
                            "kind": "Variable",
                            "name": "cond",
                            "variableName": "cond"
                          }
                        ],
                        "documentName": "RelayModernEnvironmentNoInlineTestModuleQuery",
                        "fragmentName": "RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name",
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
        "storageKey": "node(id:\"1\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentNoInlineTestModuleQuery",
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
                        "args": [
                          {
                            "kind": "Variable",
                            "name": "RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$cond",
                            "variableName": "cond"
                          }
                        ],
                        "documentName": "RelayModernEnvironmentNoInlineTestModuleQuery",
                        "fragmentName": "RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": "node(id:\"1\")"
      }
    ]
  },
  "params": {
    "cacheID": "9fde611610f8356a1a1bb41564263d40",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentNoInlineTestModuleQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentNoInlineTestModuleQuery(\n  $cond: Boolean!\n) {\n  node(id: \"1\") {\n    __typename\n    ... on User {\n      nameRenderer {\n        __typename\n        ... on MarkdownUserNameRenderer {\n          ...RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name_yuQoQ\n          __module_operation_RelayModernEnvironmentNoInlineTestModuleQuery: js(module: \"RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentNoInlineTestModuleQuery.node.nameRenderer\")\n          __module_component_RelayModernEnvironmentNoInlineTestModuleQuery: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentNoInlineTestModuleQuery.node.nameRenderer\")\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name_yuQoQ on MarkdownUserNameRenderer {\n  markdown @skip(if: $cond)\n  data @include(if: $cond) {\n    markup\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3b51939e7e4a114f33a177e515088bdb";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentNoInlineTestModuleQuery$variables,
  RelayModernEnvironmentNoInlineTestModuleQuery$data,
>*/);
