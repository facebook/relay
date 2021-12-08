/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cc65f07dc8cfedbd6eab377b96efbd8e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest1Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest2Query$variables = {||};
export type RelayMockPayloadGeneratorTest2QueryVariables = RelayMockPayloadGeneratorTest2Query$variables;
export type RelayMockPayloadGeneratorTest2Query$data = {|
  +viewer: ?{|
    +actor: ?{|
      +$fragmentSpreads: RelayMockPayloadGeneratorTest1Fragment$fragmentType,
    |},
  |},
|};
export type RelayMockPayloadGeneratorTest2QueryResponse = RelayMockPayloadGeneratorTest2Query$data;
export type RelayMockPayloadGeneratorTest2Query = {|
  variables: RelayMockPayloadGeneratorTest2QueryVariables,
  response: RelayMockPayloadGeneratorTest2Query$data,
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

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest2Query$variables,
  RelayMockPayloadGeneratorTest2Query$data,
>*/);
