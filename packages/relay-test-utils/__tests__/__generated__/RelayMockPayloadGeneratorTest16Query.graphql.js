/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<49c0f7f654ed4c2cd0256507255c9c56>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest16Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest16Query$variables = {||};
export type RelayMockPayloadGeneratorTest16QueryVariables = RelayMockPayloadGeneratorTest16Query$variables;
export type RelayMockPayloadGeneratorTest16Query$data = {|
  +nodes: ?$ReadOnlyArray<?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest16Fragment$fragmentType,
  |}>,
|};
export type RelayMockPayloadGeneratorTest16QueryResponse = RelayMockPayloadGeneratorTest16Query$data;
export type RelayMockPayloadGeneratorTest16Query = {|
  variables: RelayMockPayloadGeneratorTest16QueryVariables,
  response: RelayMockPayloadGeneratorTest16Query$data,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest16Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest16Fragment"
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
    "name": "RelayMockPayloadGeneratorTest16Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
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
                "concreteType": "Text",
                "kind": "LinkedField",
                "name": "body",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "text",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Comment",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7f51262f81ea691fe863a9a4456c0cce",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest16Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest16Query {\n  nodes {\n    __typename\n    ...RelayMockPayloadGeneratorTest16Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest16Fragment on Comment {\n  id\n  body {\n    text\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "d0f4c472087c557a5331f6d81ff6433e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest16Query$variables,
  RelayMockPayloadGeneratorTest16Query$data,
>*/);
