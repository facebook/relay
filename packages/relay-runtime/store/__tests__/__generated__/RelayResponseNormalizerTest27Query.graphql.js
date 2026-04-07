/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<cc14dc1b5d20fe3232e654eb6c676a78>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest27Query$variables = {|
  id?: ?string,
|};
export type RelayResponseNormalizerTest27Query$data = {|
  +node: ?{|
    +__typename: string,
    +actor?: ?{|
      +__typename: string,
      +id: string,
    |},
    +actors?: ?ReadonlyArray<?{|
      +__typename: string,
      +id: string,
    |}>,
    +id: string,
  |},
|};
export type RelayResponseNormalizerTest27Query = {|
  response: RelayResponseNormalizerTest27Query$data,
  variables: RelayResponseNormalizerTest27Query$variables,
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
  (v1/*:: as any*/),
  (v2/*:: as any*/)
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
            "name": "actor",
            "plural": false,
            "selections": (v3/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actors",
            "plural": true,
            "selections": (v3/*:: as any*/),
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
    "name": "RelayResponseNormalizerTest27Query",
    "selections": (v4/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest27Query",
    "selections": (v4/*:: as any*/)
  },
  "params": {
    "cacheID": "69dac8ac54aa753ae3af1c723b0276b7",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest27Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest27Query(\n  $id: ID\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      actor {\n        id\n        __typename\n      }\n      actors {\n        id\n        __typename\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "95dfa21dba65765df5d21078e4246564";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayResponseNormalizerTest27Query$variables,
  RelayResponseNormalizerTest27Query$data,
>*/);
