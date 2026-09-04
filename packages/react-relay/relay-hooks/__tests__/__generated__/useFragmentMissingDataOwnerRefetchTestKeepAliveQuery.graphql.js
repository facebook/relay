/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9a129e363a4240cd6c038fb2501c160a>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type useFragmentMissingDataOwnerRefetchTestKeepAliveQuery$variables = {
  id: string,
};
export type useFragmentMissingDataOwnerRefetchTestKeepAliveQuery$data = {
  readonly node: ?{
    readonly id: string,
  },
};
export type useFragmentMissingDataOwnerRefetchTestKeepAliveQuery = {
  response: useFragmentMissingDataOwnerRefetchTestKeepAliveQuery$data,
  variables: useFragmentMissingDataOwnerRefetchTestKeepAliveQuery$variables,
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
    "name": "useFragmentMissingDataOwnerRefetchTestKeepAliveQuery",
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
    "name": "useFragmentMissingDataOwnerRefetchTestKeepAliveQuery",
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
    "cacheID": "12a7f4fcd84cf1b3003b3f7392499515",
    "id": null,
    "metadata": {},
    "name": "useFragmentMissingDataOwnerRefetchTestKeepAliveQuery",
    "operationKind": "query",
    "text": "query useFragmentMissingDataOwnerRefetchTestKeepAliveQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "1a1f85e95c8c0ed8143b68b1ffb39df3";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  useFragmentMissingDataOwnerRefetchTestKeepAliveQuery$variables,
  useFragmentMissingDataOwnerRefetchTestKeepAliveQuery$data,
>*/);
