/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e3b730b5e911ef87a7506a798e6d958e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest20Query$variables = {|
  id?: ?string,
|};
export type RelayResponseNormalizerTest20QueryVariables = RelayResponseNormalizerTest20Query$variables;
export type RelayResponseNormalizerTest20Query$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +firstName?: ?string,
    +profilePicture?: ?{|
      +uri: ?string,
    |},
  |},
|};
export type RelayResponseNormalizerTest20QueryResponse = RelayResponseNormalizerTest20Query$data;
export type RelayResponseNormalizerTest20Query = {|
  variables: RelayResponseNormalizerTest20QueryVariables,
  response: RelayResponseNormalizerTest20Query$data,
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
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "size",
                "value": 100
              }
            ],
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "profilePicture",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "uri",
                "storageKey": null
              }
            ],
            "storageKey": "profilePicture(size:100)"
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
    "name": "RelayResponseNormalizerTest20Query",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest20Query",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "60fec8ba1813a5425317d37f55da5888",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest20Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest20Query(\n  $id: ID\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      firstName\n      profilePicture(size: 100) {\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "480a7c1f81ad3ba8d5b3a31fef679b42";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest20Query$variables,
  RelayResponseNormalizerTest20Query$data,
>*/);
