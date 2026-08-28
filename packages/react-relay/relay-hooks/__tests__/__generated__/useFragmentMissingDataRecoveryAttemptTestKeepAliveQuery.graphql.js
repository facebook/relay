/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6305b6658ec86909b41a1ede950a6cf7>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type useFragmentMissingDataRecoveryAttemptTestKeepAliveQuery$variables = {
  id: string,
};
export type useFragmentMissingDataRecoveryAttemptTestKeepAliveQuery$data = {
  readonly node: ?{
    readonly id: string,
  },
};
export type useFragmentMissingDataRecoveryAttemptTestKeepAliveQuery = {
  response: useFragmentMissingDataRecoveryAttemptTestKeepAliveQuery$data,
  variables: useFragmentMissingDataRecoveryAttemptTestKeepAliveQuery$variables,
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
    "name": "useFragmentMissingDataRecoveryAttemptTestKeepAliveQuery",
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
    "name": "useFragmentMissingDataRecoveryAttemptTestKeepAliveQuery",
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
    "cacheID": "e0fe7523fdbc70e43f5b7aab8cae848d",
    "id": null,
    "metadata": {},
    "name": "useFragmentMissingDataRecoveryAttemptTestKeepAliveQuery",
    "operationKind": "query",
    "text": "query useFragmentMissingDataRecoveryAttemptTestKeepAliveQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "745c42765a8f7c710cde7c08e9544845";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  useFragmentMissingDataRecoveryAttemptTestKeepAliveQuery$variables,
  useFragmentMissingDataRecoveryAttemptTestKeepAliveQuery$data,
>*/);
