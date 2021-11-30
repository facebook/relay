/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<db5ed921f116e0ada84cf4924f302c74>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest34Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest48Query$variables = {||};
export type RelayMockPayloadGeneratorTest48QueryVariables = RelayMockPayloadGeneratorTest48Query$variables;
export type RelayMockPayloadGeneratorTest48Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest34Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest48QueryResponse = RelayMockPayloadGeneratorTest48Query$data;
export type RelayMockPayloadGeneratorTest48Query = {|
  variables: RelayMockPayloadGeneratorTest48QueryVariables,
  response: RelayMockPayloadGeneratorTest48Query$data,
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
    "name": "RelayMockPayloadGeneratorTest48Query",
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
            "name": "RelayMockPayloadGeneratorTest34Fragment"
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
    "name": "RelayMockPayloadGeneratorTest48Query",
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
                        "documentName": "RelayMockPayloadGeneratorTest34Fragment",
                        "fragmentName": "RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name",
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
    "cacheID": "b4222b6c6072e9385ee30a3023eb77bc",
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
        "node.nameRenderer.__module_component_RelayMockPayloadGeneratorTest34Fragment": (v3/*: any*/),
        "node.nameRenderer.__module_operation_RelayMockPayloadGeneratorTest34Fragment": (v3/*: any*/),
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
    "name": "RelayMockPayloadGeneratorTest48Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest48Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest34Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest34Fragment on User {\n  id\n  nameRenderer {\n    __typename\n    ... on MarkdownUserNameRenderer {\n      ...RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name\n      __module_operation_RelayMockPayloadGeneratorTest34Fragment: js(module: \"RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayMockPayloadGeneratorTest34Fragment.nameRenderer\")\n      __module_component_RelayMockPayloadGeneratorTest34Fragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayMockPayloadGeneratorTest34Fragment.nameRenderer\")\n    }\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "420a4f67dcb61f38361f4e5565b8497a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest48Query$variables,
  RelayMockPayloadGeneratorTest48Query$data,
>*/);
