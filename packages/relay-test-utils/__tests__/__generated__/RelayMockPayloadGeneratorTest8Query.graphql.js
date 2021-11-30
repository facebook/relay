/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3ae8619682b3aa38d7f9f4fe1f4a6c9e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest8Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest8Query$variables = {||};
export type RelayMockPayloadGeneratorTest8QueryVariables = RelayMockPayloadGeneratorTest8Query$variables;
export type RelayMockPayloadGeneratorTest8Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest8Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest8QueryResponse = RelayMockPayloadGeneratorTest8Query$data;
export type RelayMockPayloadGeneratorTest8Query = {|
  variables: RelayMockPayloadGeneratorTest8QueryVariables,
  response: RelayMockPayloadGeneratorTest8Query$data,
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest8Query",
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
            "name": "RelayMockPayloadGeneratorTest8Fragment"
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
    "name": "RelayMockPayloadGeneratorTest8Query",
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
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actor",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "backgroundImage",
                "plural": false,
                "selections": [
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
                    "name": "uri",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Page",
            "abstractKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "dbc8388487cb6fe5bfa3310be528d8a0",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest8Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest8Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest8Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest8Fragment on Page {\n  actor {\n    __typename\n    id\n    name\n  }\n  backgroundImage {\n    width\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "dcc5f3c62fd805745834727a37388a3f";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest8Query$variables,
  RelayMockPayloadGeneratorTest8Query$data,
>*/);
