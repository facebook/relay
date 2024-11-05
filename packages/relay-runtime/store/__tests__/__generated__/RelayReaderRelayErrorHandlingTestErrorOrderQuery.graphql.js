/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2e1d56f339c3fc473fcf40d268b97df2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderRelayErrorHandlingTestErrorOrderQuery$variables = {||};
export type RelayReaderRelayErrorHandlingTestErrorOrderQuery$data = {|
  +also_me: ?{|
    +name: ?string,
    +nearest_neighbor: {|
      +name: ?string,
    |},
  |},
  +me: ?{|
    +name: ?string,
  |},
|};
export type RelayReaderRelayErrorHandlingTestErrorOrderQuery = {|
  response: RelayReaderRelayErrorHandlingTestErrorOrderQuery$data,
  variables: RelayReaderRelayErrorHandlingTestErrorOrderQuery$variables,
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
v1 = [
  (v0/*: any*/)
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  (v0/*: any*/),
  (v2/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "throwOnFieldError": true
    },
    "name": "RelayReaderRelayErrorHandlingTestErrorOrderQuery",
    "selections": [
      {
        "alias": "also_me",
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "nearest_neighbor",
            "plural": false,
            "selections": (v1/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": (v1/*: any*/),
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
    "name": "RelayReaderRelayErrorHandlingTestErrorOrderQuery",
    "selections": [
      {
        "alias": "also_me",
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "nearest_neighbor",
            "plural": false,
            "selections": (v3/*: any*/),
            "storageKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0ca4693a410c65d12f516d013dc142c2",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTestErrorOrderQuery",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTestErrorOrderQuery {\n  also_me: me {\n    name\n    nearest_neighbor {\n      name\n      id\n    }\n    id\n  }\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d5a7d5606148861a51f3e0ff315a68b3";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRelayErrorHandlingTestErrorOrderQuery$variables,
  RelayReaderRelayErrorHandlingTestErrorOrderQuery$data,
>*/);
