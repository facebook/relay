/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0c541b75c9e42f834548adf70ef7d9dd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type DataCheckerTest4Fragment$fragmentType = any;
export type DataCheckerTest4Query$variables = {|
  id: string,
|};
export type DataCheckerTest4QueryVariables = DataCheckerTest4Query$variables;
export type DataCheckerTest4Query$data = {|
  +node: ?{|
    +$fragmentSpreads: DataCheckerTest4Fragment$fragmentType,
  |},
|};
export type DataCheckerTest4QueryResponse = DataCheckerTest4Query$data;
export type DataCheckerTest4Query = {|
  variables: DataCheckerTest4QueryVariables,
  response: DataCheckerTest4Query$data,
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
    "name": "DataCheckerTest4Query",
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
            "name": "DataCheckerTest4Fragment"
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
    "name": "DataCheckerTest4Query",
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
                        "documentName": "DataCheckerTest4Fragment",
                        "fragmentName": "DataCheckerTestPlainUserNameRenderer_nameFragment",
                        "fragmentPropName": "nameFragment",
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
                        "documentName": "DataCheckerTest4Fragment",
                        "fragmentName": "DataCheckerTestMarkdownUserNameRenderer_nameFragment",
                        "fragmentPropName": "nameFragment",
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "af258d1faf1d10f881258dedb344a7aa",
    "id": null,
    "metadata": {},
    "name": "DataCheckerTest4Query",
    "operationKind": "query",
    "text": "query DataCheckerTest4Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...DataCheckerTest4Fragment\n    id\n  }\n}\n\nfragment DataCheckerTest4Fragment on User {\n  id\n  nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...DataCheckerTestPlainUserNameRenderer_nameFragment\n      __module_operation_DataCheckerTest4Fragment: js(module: \"DataCheckerTestPlainUserNameRenderer_nameFragment$normalization.graphql\", id: \"DataCheckerTest4Fragment.nameRenderer\")\n      __module_component_DataCheckerTest4Fragment: js(module: \"PlainUserNameRenderer.react\", id: \"DataCheckerTest4Fragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...DataCheckerTestMarkdownUserNameRenderer_nameFragment\n      __module_operation_DataCheckerTest4Fragment: js(module: \"DataCheckerTestMarkdownUserNameRenderer_nameFragment$normalization.graphql\", id: \"DataCheckerTest4Fragment.nameRenderer\")\n      __module_component_DataCheckerTest4Fragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"DataCheckerTest4Fragment.nameRenderer\")\n    }\n  }\n}\n\nfragment DataCheckerTestMarkdownUserNameRenderer_nameFragment on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment DataCheckerTestPlainUserNameRenderer_nameFragment on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a9b9699255a75903b81e31abf46a581d";
}

module.exports = ((node/*: any*/)/*: Query<
  DataCheckerTest4Query$variables,
  DataCheckerTest4Query$data,
>*/);
