/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8283fe42320e89497018672476d7d21b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest28Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest21Query$variables = {||};
export type RelayMockPayloadGeneratorTest21QueryVariables = RelayMockPayloadGeneratorTest21Query$variables;
export type RelayMockPayloadGeneratorTest21Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest28Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest21QueryResponse = RelayMockPayloadGeneratorTest21Query$data;
export type RelayMockPayloadGeneratorTest21Query = {|
  variables: RelayMockPayloadGeneratorTest21QueryVariables,
  response: RelayMockPayloadGeneratorTest21Query$data,
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
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v2 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest21Query",
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
            "name": "RelayMockPayloadGeneratorTest28Fragment"
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
    "name": "RelayMockPayloadGeneratorTest21Query",
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
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
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profile_picture",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "uri",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "width",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "height",
                    "storageKey": null
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
    "cacheID": "bf9230c2a09086a8adc3a4d038a1d0f6",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "node.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "node.name": (v1/*: any*/),
        "node.profile_picture": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Image"
        },
        "node.profile_picture.height": (v2/*: any*/),
        "node.profile_picture.uri": (v1/*: any*/),
        "node.profile_picture.width": (v2/*: any*/)
      }
    },
    "name": "RelayMockPayloadGeneratorTest21Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest21Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest28Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest28Fragment on User {\n  id\n  name\n  profile_picture {\n    uri\n    width\n    height\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bbea6ffc62a6e03cff58249ad8368c27";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest21Query$variables,
  RelayMockPayloadGeneratorTest21Query$data,
>*/);
