/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f1f1bf2286adb7737cb6c529a9b3f0fe>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTestFragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest1Query$variables = {||};
export type RelayMockPayloadGeneratorTest1QueryVariables = RelayMockPayloadGeneratorTest1Query$variables;
export type RelayMockPayloadGeneratorTest1Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTestFragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest1QueryResponse = RelayMockPayloadGeneratorTest1Query$data;
export type RelayMockPayloadGeneratorTest1Query = {|
  variables: RelayMockPayloadGeneratorTest1QueryVariables,
  response: RelayMockPayloadGeneratorTest1Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest1Query",
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
            "name": "RelayMockPayloadGeneratorTestFragment"
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
    "name": "RelayMockPayloadGeneratorTest1Query",
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
    "cacheID": "f39283a2ef7a702acb5069d604584178",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest1Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest1Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTestFragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTestFragment on User {\n  id\n  name\n  profile_picture {\n    uri\n    width\n    height\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "84c1a5848aae26089f4aaaaa74c56543";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest1Query$variables,
  RelayMockPayloadGeneratorTest1Query$data,
>*/);
