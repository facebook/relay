/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<422b57ad516c762491279b9ca1819589>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTestNameRendererFragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest44Query$variables = {||};
export type RelayMockPayloadGeneratorTest44QueryVariables = RelayMockPayloadGeneratorTest44Query$variables;
export type RelayMockPayloadGeneratorTest44Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTestNameRendererFragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest44QueryResponse = RelayMockPayloadGeneratorTest44Query$data;
export type RelayMockPayloadGeneratorTest44Query = {|
  variables: RelayMockPayloadGeneratorTest44QueryVariables,
  response: RelayMockPayloadGeneratorTest44Query$data,
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
    "name": "RelayMockPayloadGeneratorTest44Query",
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
            "name": "RelayMockPayloadGeneratorTestNameRendererFragment"
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
    "name": "RelayMockPayloadGeneratorTest44Query",
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
                        "documentName": "RelayMockPayloadGeneratorTestNameRendererFragment",
                        "fragmentName": "RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name",
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
    "cacheID": "0e56ed06342d0d1740dd9af5907918e7",
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
        "node.nameRenderer.__module_component_RelayMockPayloadGeneratorTestNameRendererFragment": (v3/*: any*/),
        "node.nameRenderer.__module_operation_RelayMockPayloadGeneratorTestNameRendererFragment": (v3/*: any*/),
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
    "name": "RelayMockPayloadGeneratorTest44Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest44Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTestNameRendererFragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTestNameRendererFragment on User {\n  id\n  nameRenderer {\n    __typename\n    ... on MarkdownUserNameRenderer {\n      ...RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name\n      __module_operation_RelayMockPayloadGeneratorTestNameRendererFragment: js(module: \"RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayMockPayloadGeneratorTestNameRendererFragment.nameRenderer\")\n      __module_component_RelayMockPayloadGeneratorTestNameRendererFragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayMockPayloadGeneratorTestNameRendererFragment.nameRenderer\")\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bad22ec9565e842bc6f16eb946a3a2d5";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest44Query$variables,
  RelayMockPayloadGeneratorTest44Query$data,
>*/);
