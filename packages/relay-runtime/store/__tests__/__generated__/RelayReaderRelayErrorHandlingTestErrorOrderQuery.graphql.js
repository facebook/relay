/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<eefd23f12ad80dcf2fe6361567c96f89>>
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
  (v0/*:: as any*/)
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  (v0/*:: as any*/),
  (v2/*:: as any*/)
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
          (v0/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "nearest_neighbor",
            "plural": false,
            "selections": (v1/*:: as any*/),
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
        "selections": (v1/*:: as any*/),
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
          (v0/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "nearest_neighbor",
            "plural": false,
            "selections": (v3/*:: as any*/),
            "storageKey": null
          },
          (v2/*:: as any*/)
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
        "selections": (v3/*:: as any*/),
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
  (node/*:: as any*/).hash = "d5a7d5606148861a51f3e0ff315a68b3";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderRelayErrorHandlingTestErrorOrderQuery$variables,
  RelayReaderRelayErrorHandlingTestErrorOrderQuery$data,
>*/);
