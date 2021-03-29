/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ef89891c1eb1facc5fcd2de4257f2f97>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayMockPayloadGeneratorTest1Fragment$ref = any;
export type RelayMockPayloadGeneratorTest2QueryVariables = {||};
export type RelayMockPayloadGeneratorTest2QueryResponse = {|
  +viewer: ?{|
    +actor: ?{|
      +$fragmentRefs: RelayMockPayloadGeneratorTest1Fragment$ref,
    |},
  |},
|};
export type RelayMockPayloadGeneratorTest2Query = {|
  variables: RelayMockPayloadGeneratorTest2QueryVariables,
  response: RelayMockPayloadGeneratorTest2QueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest2Query",
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
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayMockPayloadGeneratorTest1Fragment"
              }
            ],
            "storageKey": null
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
    "name": "RelayMockPayloadGeneratorTest2Query",
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
                "kind": "TypeDiscriminator",
                "abstractKey": "__isActor"
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
                  }
                ],
                "type": "Named",
                "abstractKey": "__isNamed"
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "firstName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "lastName",
                    "storageKey": null
                  }
                ],
                "type": "User",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "websites",
                    "storageKey": null
                  }
                ],
                "type": "Page",
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
    "cacheID": "a87b654b777721d580583cc4f06d793d",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest2Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest2Query {\n  viewer {\n    actor {\n      __typename\n      ...RelayMockPayloadGeneratorTest1Fragment\n      id\n    }\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest1Fragment on Actor {\n  __isActor: __typename\n  id\n  ... on Named {\n    __isNamed: __typename\n    name\n  }\n  ... on User {\n    firstName\n    lastName\n  }\n  ... on Page {\n    websites\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "4d7e8948fb94a3317465567afbe97813";
}

module.exports = node;
