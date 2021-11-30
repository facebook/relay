/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5651a6cda00ee440d7fffee874cbff4e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest32Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest46Query$variables = {||};
export type RelayMockPayloadGeneratorTest46QueryVariables = RelayMockPayloadGeneratorTest46Query$variables;
export type RelayMockPayloadGeneratorTest46Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest32Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest46QueryResponse = RelayMockPayloadGeneratorTest46Query$data;
export type RelayMockPayloadGeneratorTest46Query = {|
  variables: RelayMockPayloadGeneratorTest46QueryVariables,
  response: RelayMockPayloadGeneratorTest46Query$data,
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
    "name": "RelayMockPayloadGeneratorTest46Query",
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
            "name": "RelayMockPayloadGeneratorTest32Fragment"
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
    "name": "RelayMockPayloadGeneratorTest46Query",
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
                        "documentName": "RelayMockPayloadGeneratorTest32Fragment",
                        "fragmentName": "RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name",
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
                        "documentName": "RelayMockPayloadGeneratorTest32Fragment",
                        "fragmentName": "RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name",
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
    "cacheID": "287ec893884663da45f88d7f4777358f",
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
        "node.nameRenderer.__module_component_RelayMockPayloadGeneratorTest32Fragment": (v3/*: any*/),
        "node.nameRenderer.__module_operation_RelayMockPayloadGeneratorTest32Fragment": (v3/*: any*/),
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
    "name": "RelayMockPayloadGeneratorTest46Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest46Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest32Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest32Fragment on User {\n  id\n  nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name\n      __module_operation_RelayMockPayloadGeneratorTest32Fragment: js(module: \"RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$normalization.graphql\", id: \"RelayMockPayloadGeneratorTest32Fragment.nameRenderer\")\n      __module_component_RelayMockPayloadGeneratorTest32Fragment: js(module: \"PlainUserNameRenderer.react\", id: \"RelayMockPayloadGeneratorTest32Fragment.nameRenderer\")\n    }\n    ... on MarkdownUserNameRenderer {\n      ...RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name\n      __module_operation_RelayMockPayloadGeneratorTest32Fragment: js(module: \"RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayMockPayloadGeneratorTest32Fragment.nameRenderer\")\n      __module_component_RelayMockPayloadGeneratorTest32Fragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayMockPayloadGeneratorTest32Fragment.nameRenderer\")\n    }\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9be5402320aa98b21b5d86334183b77f";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest46Query$variables,
  RelayMockPayloadGeneratorTest46Query$data,
>*/);
