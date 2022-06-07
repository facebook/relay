/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3e28710ed4b1bf6247d56222cc0c246f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
export type ClientOnlyQueriesTest1Query$variables = {||};
export type ClientOnlyQueriesTest1Query$data = {|
  +defaultSettings: ?{|
    +client_field: ?string,
  |},
|};
export type ClientOnlyQueriesTest1Query = {|
  response: ClientOnlyQueriesTest1Query$data,
  variables: ClientOnlyQueriesTest1Query$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Settings",
    "kind": "LinkedField",
    "name": "defaultSettings",
    "plural": false,
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "client_field",
            "storageKey": null
          }
        ]
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ClientOnlyQueriesTest1Query",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ClientOnlyQueriesTest1Query",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "66f0994dc5890a6b08b3d2c3b7c65e29",
    "id": null,
    "metadata": {},
    "name": "ClientOnlyQueriesTest1Query",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "22cf2fd45d860a9f2d7674f60dcf05dd";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  ClientOnlyQueriesTest1Query$variables,
  ClientOnlyQueriesTest1Query$data,
>*/);
