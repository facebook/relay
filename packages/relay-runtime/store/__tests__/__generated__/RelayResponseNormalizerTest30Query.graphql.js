/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a112331eaac93ec4d7e9678e760e2e37>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest30Query$variables = {||};
export type RelayResponseNormalizerTest30QueryVariables = RelayResponseNormalizerTest30Query$variables;
export type RelayResponseNormalizerTest30Query$data = {|
  +me: ?{|
    +author: ?{|
      +id: string,
    |},
  |},
|};
export type RelayResponseNormalizerTest30QueryResponse = RelayResponseNormalizerTest30Query$data;
export type RelayResponseNormalizerTest30Query = {|
  variables: RelayResponseNormalizerTest30QueryVariables,
  response: RelayResponseNormalizerTest30Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "author",
  "plural": false,
  "selections": [
    (v0/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest30Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v1/*: any*/)
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
    "name": "RelayResponseNormalizerTest30Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f2e6feda7661d66a67da8fb968ef916a",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest30Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest30Query {\n  me {\n    author {\n      id\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "afcd3f22af213b8daaa34a82ded163ad";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest30Query$variables,
  RelayResponseNormalizerTest30Query$data,
>*/);
