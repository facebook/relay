/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2bcb0dc5956db3dea5adc99c09cea9a8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest18Query$variables = {|
  id?: ?string,
|};
export type RelayResponseNormalizerTest18QueryVariables = RelayResponseNormalizerTest18Query$variables;
export type RelayResponseNormalizerTest18Query$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +actors?: ?$ReadOnlyArray<?{|
      +id: string,
      +__typename: string,
    |}>,
  |},
|};
export type RelayResponseNormalizerTest18QueryResponse = RelayResponseNormalizerTest18Query$data;
export type RelayResponseNormalizerTest18Query = {|
  variables: RelayResponseNormalizerTest18QueryVariables,
  response: RelayResponseNormalizerTest18Query$data,
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
            "name": "actors",
            "plural": true,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/)
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
    "name": "RelayResponseNormalizerTest18Query",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest18Query",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "514a19bfb085d2ffabcd60fa0ad25568",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest18Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest18Query(\n  $id: ID\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      actors {\n        id\n        __typename\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a47c0241271bec11d726c3a424d30ea1";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest18Query$variables,
  RelayResponseNormalizerTest18Query$data,
>*/);
