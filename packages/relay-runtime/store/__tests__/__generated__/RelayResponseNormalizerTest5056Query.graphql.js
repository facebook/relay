/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7bef7d5a29221f807fe7b9577c55b148>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest5056Query$variables = {|
  id?: ?string,
|};
export type RelayResponseNormalizerTest5056Query$data = {|
  +node: ?{|
    +__typename: string,
    +actors?: ?ReadonlyArray<?{|
      +__typename: string,
      +id: string,
    |}>,
    +id: string,
  |},
|};
export type RelayResponseNormalizerTest5056Query = {|
  response: RelayResponseNormalizerTest5056Query$data,
  variables: RelayResponseNormalizerTest5056Query$variables,
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
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = [
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
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      {
        "kind": "InlineFragment",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actors",
            "plural": true,
            "selections": [
              (v1/*:: as any*/),
              (v2/*:: as any*/)
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest5056Query",
    "selections": (v3/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest5056Query",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "63c98737e9365e9429d8f0e85b5d0e1f",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest5056Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest5056Query(\n  $id: ID\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      actors {\n        id\n        __typename\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "1364920a1cd7346273dfc3a3cbe8e506";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayResponseNormalizerTest5056Query$variables,
  RelayResponseNormalizerTest5056Query$data,
>*/);
