/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bc0766812aab92265842a7856937ce70>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentRetainTestQuery$variables = {||};
export type RelayModernEnvironmentRetainTestQuery$data = {|
  +me: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type RelayModernEnvironmentRetainTestQuery = {|
  response: RelayModernEnvironmentRetainTestQuery$data,
  variables: RelayModernEnvironmentRetainTestQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "me",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
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
    "name": "RelayModernEnvironmentRetainTestQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentRetainTestQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "4a303ac396520ddcaf020fcf6164a97e",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentRetainTestQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentRetainTestQuery {\n  me {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c84966ac60d5dce4dde9b131ca32502b";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentRetainTestQuery$variables,
  RelayModernEnvironmentRetainTestQuery$data,
>*/);
