/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<004a8058d8dde663ebf71ea941d6f50c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest33Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest47Query$variables = {||};
export type RelayMockPayloadGeneratorTest47QueryVariables = RelayMockPayloadGeneratorTest47Query$variables;
export type RelayMockPayloadGeneratorTest47Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest33Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest47QueryResponse = RelayMockPayloadGeneratorTest47Query$data;
export type RelayMockPayloadGeneratorTest47Query = {|
  variables: RelayMockPayloadGeneratorTest47QueryVariables,
  response: RelayMockPayloadGeneratorTest47Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v2 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v3 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "JSDependency"
},
v4 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest47Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest33Fragment"
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest47Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/),
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
                  (v1/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "args": null,
                        "documentName": "RelayMockPayloadGeneratorTest33Fragment",
                        "fragmentName": "RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name",
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
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "44911f15ec7690f4aa6a5b9061aeed98",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v2/*: any*/),
        "node.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "node.nameRenderer": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "UserNameRenderer"
        },
        "node.nameRenderer.__module_component_RelayMockPayloadGeneratorTest33Fragment": (v3/*: any*/),
        "node.nameRenderer.__module_operation_RelayMockPayloadGeneratorTest33Fragment": (v3/*: any*/),
        "node.nameRenderer.__typename": (v2/*: any*/),
        "node.nameRenderer.data": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "MarkdownUserNameData"
        },
        "node.nameRenderer.data.id": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ID"
        },
        "node.nameRenderer.data.markup": (v4/*: any*/),
        "node.nameRenderer.markdown": (v4/*: any*/)
      }
    },
    "name": "RelayMockPayloadGeneratorTest47Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest47Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest33Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest33Fragment on User {\n  id\n  nameRenderer {\n    __typename\n    ... on MarkdownUserNameRenderer {\n      ...RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name\n      __module_operation_RelayMockPayloadGeneratorTest33Fragment: js(module: \"RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayMockPayloadGeneratorTest33Fragment.nameRenderer\")\n      __module_component_RelayMockPayloadGeneratorTest33Fragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayMockPayloadGeneratorTest33Fragment.nameRenderer\")\n    }\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4b48e2f43a325d78c6749a5475dbed06";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest47Query$variables,
  RelayMockPayloadGeneratorTest47Query$data,
>*/);
