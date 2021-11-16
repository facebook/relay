/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7e105530cf18e267e7ddb36dbedb869b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest21Query$variables = {||};
export type RelayResponseNormalizerTest21QueryVariables = RelayResponseNormalizerTest21Query$variables;
export type RelayResponseNormalizerTest21Query$data = {|
  +named: ?{|
    +name: ?string,
    +id?: string,
  |},
|};
export type RelayResponseNormalizerTest21QueryResponse = RelayResponseNormalizerTest21Query$data;
export type RelayResponseNormalizerTest21Query = {|
  variables: RelayResponseNormalizerTest21QueryVariables,
  response: RelayResponseNormalizerTest21Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest21Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "named",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
    "name": "RelayResponseNormalizerTest21Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "named",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v0/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ae4b89aa98be027f06fe676824b5232d",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest21Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest21Query {\n  named {\n    __typename\n    name\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "be9ff9516a4df45e046bf7af8d4b1049";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest21Query$variables,
  RelayResponseNormalizerTest21Query$data,
>*/);
