/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3baf9f694bbbb9cdc35db109ae620cd4>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useFragmentMissingDataRecoveryStaleReadTestUserFragment$fragmentType } from "./useFragmentMissingDataRecoveryStaleReadTestUserFragment.graphql";
export type useFragmentMissingDataRecoveryStaleReadTestQuery$variables = {
  id: string,
};
export type useFragmentMissingDataRecoveryStaleReadTestQuery$data = {
  readonly node: ?{
    readonly $fragmentSpreads: useFragmentMissingDataRecoveryStaleReadTestUserFragment$fragmentType,
  },
};
export type useFragmentMissingDataRecoveryStaleReadTestQuery = {
  response: useFragmentMissingDataRecoveryStaleReadTestQuery$data,
  variables: useFragmentMissingDataRecoveryStaleReadTestQuery$variables,
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
  "name": "name",
  "storageKey": null
},
v3 = {
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
    "name": "useFragmentMissingDataRecoveryStaleReadTestQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "useFragmentMissingDataRecoveryStaleReadTestUserFragment"
          }
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
    "name": "useFragmentMissingDataRecoveryStaleReadTestQuery",
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
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v3/*:: as any*/),
                  (v2/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          },
          (v3/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0b2cc332c6f9f6ba423dedce441272ac",
    "id": null,
    "metadata": {},
    "name": "useFragmentMissingDataRecoveryStaleReadTestQuery",
    "operationKind": "query",
    "text": "query useFragmentMissingDataRecoveryStaleReadTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useFragmentMissingDataRecoveryStaleReadTestUserFragment\n    id\n  }\n}\n\nfragment useFragmentMissingDataRecoveryStaleReadTestUserFragment on User {\n  name\n  author {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "b1f842e4898ff9941928392220c78424";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  useFragmentMissingDataRecoveryStaleReadTestQuery$variables,
  useFragmentMissingDataRecoveryStaleReadTestQuery$data,
>*/);
