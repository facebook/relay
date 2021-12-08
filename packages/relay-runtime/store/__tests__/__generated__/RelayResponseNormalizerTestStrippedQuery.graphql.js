/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5442ea263fd6a44a60a32dfab0507702>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTestStrippedQuery$variables = {|
  id?: ?string,
|};
export type RelayResponseNormalizerTestStrippedQueryVariables = RelayResponseNormalizerTestStrippedQuery$variables;
export type RelayResponseNormalizerTestStrippedQuery$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +firstName?: ?string,
    +nickname?: ?string,
    +foo?: ?{|
      +bar: ?{|
        +content: ?string,
      |},
    |},
  |},
|};
export type RelayResponseNormalizerTestStrippedQueryResponse = RelayResponseNormalizerTestStrippedQuery$data;
export type RelayResponseNormalizerTestStrippedQuery = {|
  variables: RelayResponseNormalizerTestStrippedQueryVariables,
  response: RelayResponseNormalizerTestStrippedQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": null,
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "__typename",
        "storageKey": null
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
            "kind": "ClientExtension",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "nickname",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Foo",
                "kind": "LinkedField",
                "name": "foo",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Bar",
                    "kind": "LinkedField",
                    "name": "bar",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "content",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ]
          }
        ],
        "type": "User",
        "abstractKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTestStrippedQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTestStrippedQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "37a66fa4bf09ce1ccc9633f40513f90a",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTestStrippedQuery",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTestStrippedQuery(\n  $id: ID\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      firstName\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0e208d9fa88413c2a2a25066a002b64d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTestStrippedQuery$variables,
  RelayResponseNormalizerTestStrippedQuery$data,
>*/);
