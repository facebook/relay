/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a2fe6c10cc45c1aab6dc47a48667e8b4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentBatchUpdatesTestQuery2$variables = {||};
export type RelayModernEnvironmentBatchUpdatesTestQuery2$data = {|
  +me: ?{|
    +emailAddresses: ?ReadonlyArray<?string>,
    +name: ?string,
  |},
|};
export type RelayModernEnvironmentBatchUpdatesTestQuery2 = {|
  response: RelayModernEnvironmentBatchUpdatesTestQuery2$data,
  variables: RelayModernEnvironmentBatchUpdatesTestQuery2$variables,
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "emailAddresses",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentBatchUpdatesTestQuery2",
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
          (v1/*:: as any*/)
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
    "name": "RelayModernEnvironmentBatchUpdatesTestQuery2",
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
          (v1/*:: as any*/),
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
    "cacheID": "4759d48ef4689ce8c9ef0a6fb99e4948",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentBatchUpdatesTestQuery2",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentBatchUpdatesTestQuery2 {\n  me {\n    name\n    emailAddresses\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "162a74f89ca1c6069df708f55975589c";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernEnvironmentBatchUpdatesTestQuery2$variables,
  RelayModernEnvironmentBatchUpdatesTestQuery2$data,
>*/);
