/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<32a1abc40e7b44572cc3c4b4476f3d54>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest31Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest45Query$variables = {||};
export type RelayMockPayloadGeneratorTest45QueryVariables = RelayMockPayloadGeneratorTest45Query$variables;
export type RelayMockPayloadGeneratorTest45Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest31Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest45QueryResponse = RelayMockPayloadGeneratorTest45Query$data;
export type RelayMockPayloadGeneratorTest45Query = {|
  variables: RelayMockPayloadGeneratorTest45QueryVariables,
  response: RelayMockPayloadGeneratorTest45Query$data,
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
    "name": "RelayMockPayloadGeneratorTest45Query",
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
            "name": "RelayMockPayloadGeneratorTest31Fragment"
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
    "name": "RelayMockPayloadGeneratorTest45Query",
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
                  (v1/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "args": null,
                        "documentName": "RelayMockPayloadGeneratorTest31Fragment",
                        "fragmentName": "RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name",
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
                        "documentName": "RelayMockPayloadGeneratorTest31Fragment",
                        "fragmentName": "RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name",
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
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "6a3ed1c7888df21c99128986e1268abb",
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
        "node.nameRenderer.__module_component_RelayMockPayloadGeneratorTest31Fragment": (v3/*: any*/),
        "node.nameRenderer.__module_operation_RelayMockPayloadGeneratorTest31Fragment": (v3/*: any*/),
        "node.nameRenderer.__typename": (v2/*: any*/),
        "node.nameRenderer.data": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PlainUserNameData"
        },
        "node.nameRenderer.data.id": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ID"
        },
        "node.nameRenderer.data.markup": (v4/*: any*/),
        "node.nameRenderer.data.text": (v4/*: any*/),
        "node.nameRenderer.markdown": (v4/*: any*/),
        "node.nameRenderer.plaintext": (v4/*: any*/)
      }
    },
    "name": "RelayMockPayloadGeneratorTest45Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest45Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest31Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest31Fragment on User {\n  id\n  nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name\n      __module_operation_RelayMockPayloadGeneratorTest31Fragment: js(module: \"RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name$normalization.graphql\", id: \"RelayMockPayloadGeneratorTest31Fragment.nameRenderer\")\n      __module_component_RelayMockPayloadGeneratorTest31Fragment: js(module: \"PlainUserNameRenderer.react\", id: \"RelayMockPayloadGeneratorTest31Fragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name\n      __module_operation_RelayMockPayloadGeneratorTest31Fragment: js(module: \"RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayMockPayloadGeneratorTest31Fragment.nameRenderer\")\n      __module_component_RelayMockPayloadGeneratorTest31Fragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayMockPayloadGeneratorTest31Fragment.nameRenderer\")\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c45f56ca143cdb6c8633da434a4e229d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest45Query$variables,
  RelayMockPayloadGeneratorTest45Query$data,
>*/);
