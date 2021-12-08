/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0c761036eddd80256a4a1bcde407b0fe>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest11Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest11Query$variables = {||};
export type RelayMockPayloadGeneratorTest11QueryVariables = RelayMockPayloadGeneratorTest11Query$variables;
export type RelayMockPayloadGeneratorTest11Query$data = {|
  +viewer: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest11Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest11QueryResponse = RelayMockPayloadGeneratorTest11Query$data;
export type RelayMockPayloadGeneratorTest11Query = {|
  variables: RelayMockPayloadGeneratorTest11QueryVariables,
  response: RelayMockPayloadGeneratorTest11Query$data,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest11Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest11Fragment"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest11Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
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
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a8dba334ee2fac681a003e9237c06afa",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest11Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest11Query {\n  viewer {\n    ...RelayMockPayloadGeneratorTest11Fragment\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest11Fragment on Viewer {\n  actor {\n    __typename\n    ... on User {\n      id\n      name\n      profile_picture {\n        uri\n        height\n      }\n    }\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "9bba3b6a47538ff44381cbb8fec3ff98";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest11Query$variables,
  RelayMockPayloadGeneratorTest11Query$data,
>*/);
