/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<44adc6f49f559c242b01abb5395d7a02>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTest1Fragment$fragmentType = any;
export type RelayResponseNormalizerTest5Query$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTest5QueryVariables = RelayResponseNormalizerTest5Query$variables;
export type RelayResponseNormalizerTest5Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTest1Fragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest5QueryResponse = RelayResponseNormalizerTest5Query$data;
export type RelayResponseNormalizerTest5Query = {|
  variables: RelayResponseNormalizerTest5QueryVariables,
  response: RelayResponseNormalizerTest5Query$data,
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
    "name": "RelayResponseNormalizerTest5Query",
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
            "name": "RelayResponseNormalizerTest1Fragment"
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
    "name": "RelayResponseNormalizerTest5Query",
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
                        "documentName": "RelayResponseNormalizerTest1Fragment",
                        "fragmentName": "RelayResponseNormalizerTest1PlainUserNameRenderer_name",
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
                        "documentName": "RelayResponseNormalizerTest1Fragment",
                        "fragmentName": "RelayResponseNormalizerTest1MarkdownUserNameRenderer_name",
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
    "cacheID": "336121b4fabd5b1428a68032d3002bbb",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest5Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest5Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayResponseNormalizerTest1Fragment\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTest1Fragment on User {\n  id\n  nameRenderer {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...RelayResponseNormalizerTest1PlainUserNameRenderer_name\n      __module_operation_RelayResponseNormalizerTest1Fragment: js(module: \"RelayResponseNormalizerTest1PlainUserNameRenderer_name$normalization.graphql\", id: \"RelayResponseNormalizerTest1Fragment.nameRenderer\")\n      __module_component_RelayResponseNormalizerTest1Fragment: js(module: \"PlainUserNameRenderer.react\", id: \"RelayResponseNormalizerTest1Fragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...RelayResponseNormalizerTest1MarkdownUserNameRenderer_name\n      __module_operation_RelayResponseNormalizerTest1Fragment: js(module: \"RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayResponseNormalizerTest1Fragment.nameRenderer\")\n      __module_component_RelayResponseNormalizerTest1Fragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayResponseNormalizerTest1Fragment.nameRenderer\")\n    }\n  }\n}\n\nfragment RelayResponseNormalizerTest1MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTest1PlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "80a957b7f697c6ec8835d41f8e5cfecd";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest5Query$variables,
  RelayResponseNormalizerTest5Query$data,
>*/);
