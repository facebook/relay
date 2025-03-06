/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6e21ab76283f7b2a77fccae86d5f2aa2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @indirectDataDrivenDependency RelayMockPayloadGeneratorTest67Fragment.nameRenderer {"branches":{"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayMockPayloadGeneratorTest67PlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayMockPayloadGeneratorTest67Fragment$fragmentType } from "./RelayMockPayloadGeneratorTest67Fragment.graphql";
export type RelayMockPayloadGeneratorTest67Query$variables = {||};
export type RelayMockPayloadGeneratorTest67Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest67Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest67Query = {|
  response: RelayMockPayloadGeneratorTest67Query$data,
  variables: RelayMockPayloadGeneratorTest67Query$variables,
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
    "name": "RelayMockPayloadGeneratorTest67Query",
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
            "name": "RelayMockPayloadGeneratorTest67Fragment"
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
    "name": "RelayMockPayloadGeneratorTest67Query",
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
                        "documentName": "RelayMockPayloadGeneratorTest67Fragment",
                        "fragmentName": "RelayMockPayloadGeneratorTest67PlainUserNameRenderer_name",
                        "fragmentPropName": "name",
                        "kind": "ModuleImport"
                      }
                    ],
                    "type": "PlainUserNameRenderer",
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
    "cacheID": "0ae903db9d578aaf4dd7019f4d024645",
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
        "node.nameRenderer.__module_component_RelayMockPayloadGeneratorTest67Fragment": (v3/*: any*/),
        "node.nameRenderer.__module_operation_RelayMockPayloadGeneratorTest67Fragment": (v3/*: any*/),
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
        "node.nameRenderer.data.text": (v4/*: any*/),
        "node.nameRenderer.plaintext": (v4/*: any*/)
      }
    },
    "name": "RelayMockPayloadGeneratorTest67Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest67Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest67Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest67Fragment on User {\n  id\n  nameRenderer {\n    __typename\n    ... on PlainUserNameRenderer {\n      ...RelayMockPayloadGeneratorTest67PlainUserNameRenderer_name\n      __module_operation_RelayMockPayloadGeneratorTest67Fragment: js(module: \"RelayMockPayloadGeneratorTest67PlainUserNameRenderer_name$normalization.graphql\", id: \"RelayMockPayloadGeneratorTest67Fragment.nameRenderer\")\n      __module_component_RelayMockPayloadGeneratorTest67Fragment: js(module: \"PlainUserNameRenderer.react\", id: \"RelayMockPayloadGeneratorTest67Fragment.nameRenderer\")\n    }\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest67PlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ee32413bf007d34e02585799a2630ae6";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest67Query$variables,
  RelayMockPayloadGeneratorTest67Query$data,
>*/);
