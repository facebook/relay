/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2342168d16c94d361368dd51e172cd9c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest33Query$variables = {|
  id?: ?string,
  size?: ?$ReadOnlyArray<?number>,
|};
export type RelayResponseNormalizerTest33QueryVariables = RelayResponseNormalizerTest33Query$variables;
export type RelayResponseNormalizerTest33Query$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +firstName?: ?string,
    +profilePicture?: ?{|
      +uri: ?string,
    |},
  |},
|};
export type RelayResponseNormalizerTest33QueryResponse = RelayResponseNormalizerTest33Query$data;
export type RelayResponseNormalizerTest33Query = {|
  variables: RelayResponseNormalizerTest33QueryVariables,
  response: RelayResponseNormalizerTest33Query$data,
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
    "name": "RelayResponseNormalizerTest33Query",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest33Query",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "6a3b96ae87944da7484b8b843112b10a",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest33Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest33Query(\n  $id: ID\n  $size: [Int]\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      firstName\n      profilePicture(size: $size) {\n        uri\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e738ea7dee378b790e46fa1469214539";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest33Query$variables,
  RelayResponseNormalizerTest33Query$data,
>*/);
