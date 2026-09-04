/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<df076dba5c2e820165a983523b0d3237>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useFragmentMissingDataOwnerRefetchTestUserFragment$fragmentType } from "./useFragmentMissingDataOwnerRefetchTestUserFragment.graphql";
export type useFragmentMissingDataOwnerRefetchTestOwnerQuery$variables = {
  id: string,
};
export type useFragmentMissingDataOwnerRefetchTestOwnerQuery$data = {
  readonly node: ?{
    readonly $fragmentSpreads: useFragmentMissingDataOwnerRefetchTestUserFragment$fragmentType,
  },
};
export type useFragmentMissingDataOwnerRefetchTestOwnerQuery = {
  response: useFragmentMissingDataOwnerRefetchTestOwnerQuery$data,
  variables: useFragmentMissingDataOwnerRefetchTestOwnerQuery$variables,
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useFragmentMissingDataOwnerRefetchTestOwnerQuery",
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
            "name": "useFragmentMissingDataOwnerRefetchTestUserFragment"
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
    "name": "useFragmentMissingDataOwnerRefetchTestOwnerQuery",
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Date",
                "kind": "LinkedField",
                "name": "birthdate",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "day",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          },
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
    "cacheID": "5941e2ee515c83c10833a11580193c26",
    "id": null,
    "metadata": {},
    "name": "useFragmentMissingDataOwnerRefetchTestOwnerQuery",
    "operationKind": "query",
    "text": "query useFragmentMissingDataOwnerRefetchTestOwnerQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useFragmentMissingDataOwnerRefetchTestUserFragment\n    id\n  }\n}\n\nfragment useFragmentMissingDataOwnerRefetchTestUserFragment on User {\n  name\n  birthdate {\n    day\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "8338f0fba26c637a3afff95c70b07479";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  useFragmentMissingDataOwnerRefetchTestOwnerQuery$variables,
  useFragmentMissingDataOwnerRefetchTestOwnerQuery$data,
>*/);
