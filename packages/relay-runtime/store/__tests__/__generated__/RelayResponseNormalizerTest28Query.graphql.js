/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9698b6335c6c08a468dbf6bdc124bcd4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest28Query$variables = {|
  id?: ?string,
|};
export type RelayResponseNormalizerTest28QueryVariables = RelayResponseNormalizerTest28Query$variables;
export type RelayResponseNormalizerTest28Query$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +actor?: ?{|
      +id: string,
      +__typename: string,
    |},
    +actors?: ?$ReadOnlyArray<?{|
      +id: string,
      +__typename: string,
    |}>,
  |},
|};
export type RelayResponseNormalizerTest28QueryResponse = RelayResponseNormalizerTest28Query$data;
export type RelayResponseNormalizerTest28Query = {|
  variables: RelayResponseNormalizerTest28QueryVariables,
  response: RelayResponseNormalizerTest28Query$data,
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
  (v1/*: any*/),
  (v2/*: any*/)
],
v4 = [
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
      (v1/*: any*/),
      (v2/*: any*/),
      {
        "kind": "InlineFragment",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": (v3/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actors",
            "plural": true,
            "selections": (v3/*: any*/),
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
    "name": "RelayResponseNormalizerTest28Query",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest28Query",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "9866ace1f18c62ad5f39a430b7eeda86",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest28Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest28Query(\n  $id: ID\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      actor {\n        id\n        __typename\n      }\n      actors {\n        id\n        __typename\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d30a30e5d20f8dcd34e1a7dfaac67ca0";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest28Query$variables,
  RelayResponseNormalizerTest28Query$data,
>*/);
