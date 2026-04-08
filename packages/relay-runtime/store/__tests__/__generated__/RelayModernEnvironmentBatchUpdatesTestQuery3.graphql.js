/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c73bc3a5e64bc8c8679182f5d118b774>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentBatchUpdatesTestQuery3$variables = {||};
export type RelayModernEnvironmentBatchUpdatesTestQuery3$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type RelayModernEnvironmentBatchUpdatesTestQuery3 = {|
  response: RelayModernEnvironmentBatchUpdatesTestQuery3$data,
  variables: RelayModernEnvironmentBatchUpdatesTestQuery3$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentBatchUpdatesTestQuery3",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*:: as any*/)
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
    "name": "RelayModernEnvironmentBatchUpdatesTestQuery3",
    "selections": [
      {
        "alias": null,
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
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b3b0cc9ab259426d8dc718f65219142f",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentBatchUpdatesTestQuery3",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentBatchUpdatesTestQuery3 {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "84d141240dab20f9e8ebda1c81401d68";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernEnvironmentBatchUpdatesTestQuery3$variables,
  RelayModernEnvironmentBatchUpdatesTestQuery3$data,
>*/);
