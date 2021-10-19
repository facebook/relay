/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a03bfaa34bb4c9153986a206b09842dc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type RelayResponseNormalizerTest27QueryVariables = {|
  id?: ?string,
|};
export type RelayResponseNormalizerTest27QueryResponse = {|
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
export type RelayResponseNormalizerTest27Query = {|
  variables: RelayResponseNormalizerTest27QueryVariables,
  response: RelayResponseNormalizerTest27QueryResponse,
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
    "name": "RelayResponseNormalizerTest27Query",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest27Query",
    "selections": (v4/*: any*/)
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
  (node/*: any*/).hash = "95dfa21dba65765df5d21078e4246564";
}

module.exports = node;
