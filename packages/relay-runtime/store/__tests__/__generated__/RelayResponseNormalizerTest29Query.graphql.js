/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c7eaa5101e628a34dc1718a55003d9ec>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest29Query$variables = {|
  id?: ?string,
  size?: ?$ReadOnlyArray<?number>,
|};
export type RelayResponseNormalizerTest29Query$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +firstName?: ?string,
    +profilePicture?: ?{|
      +uri: ?string,
    |},
  |},
|};
export type RelayResponseNormalizerTest29Query = {|
  variables: RelayResponseNormalizerTest29Query$variables,
  response: RelayResponseNormalizerTest29Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "size"
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
                "kind": "Variable",
                "name": "size",
                "variableName": "size"
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
            "storageKey": null
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
    "name": "RelayResponseNormalizerTest29Query",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest29Query",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "deaa4eb6df12cd2e363e059269a2f896",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest29Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest29Query(\n  $id: ID\n  $size: [Int]\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      firstName\n      profilePicture(size: $size) {\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "def7aab0dc3da657c10fbc20c184dcb7";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest29Query$variables,
  RelayResponseNormalizerTest29Query$data,
>*/);
