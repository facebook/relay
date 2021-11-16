/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<45372ac4ef2b46ef3b1d55cbbd20de38>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest17Query$variables = {||};
export type RelayResponseNormalizerTest17QueryVariables = RelayResponseNormalizerTest17Query$variables;
export type RelayResponseNormalizerTest17Query$data = {|
  +me: ?{|
    +author: ?{|
      +id: string,
      +name: ?string,
    |},
  |},
|};
export type RelayResponseNormalizerTest17QueryResponse = RelayResponseNormalizerTest17Query$data;
export type RelayResponseNormalizerTest17Query = {|
  variables: RelayResponseNormalizerTest17QueryVariables,
  response: RelayResponseNormalizerTest17Query$data,
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
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest17Query",
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
    "name": "RelayResponseNormalizerTest17Query",
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
    "cacheID": "63b3cb707bd8e70e5453801a58744f26",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest17Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest17Query {\n  me {\n    author {\n      id\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "70e6bedd542c48fcc64931cdb574f489";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest17Query$variables,
  RelayResponseNormalizerTest17Query$data,
>*/);
