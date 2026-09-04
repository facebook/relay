/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<681eb82c9706918b67de65a8ffb3f153>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernStoreSubscriptionGCTestKeepAliveQuery$variables = {
  id: string,
};
export type RelayModernStoreSubscriptionGCTestKeepAliveQuery$data = {
  readonly node: ?{
    readonly id: string,
  },
};
export type RelayModernStoreSubscriptionGCTestKeepAliveQuery = {
  response: RelayModernStoreSubscriptionGCTestKeepAliveQuery$data,
  variables: RelayModernStoreSubscriptionGCTestKeepAliveQuery$variables,
};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernStoreSubscriptionGCTestKeepAliveQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayModernStoreSubscriptionGCTestKeepAliveQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "931555824c09db48e0b075d00056d86f",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreSubscriptionGCTestKeepAliveQuery",
    "operationKind": "query",
    "text": "query RelayModernStoreSubscriptionGCTestKeepAliveQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "17ed5996d1799d45061e438b796c256a";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernStoreSubscriptionGCTestKeepAliveQuery$variables,
  RelayModernStoreSubscriptionGCTestKeepAliveQuery$data,
>*/);
