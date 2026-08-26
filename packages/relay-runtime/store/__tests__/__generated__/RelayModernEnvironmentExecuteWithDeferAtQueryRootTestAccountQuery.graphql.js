/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5b43f90638863000762c2e3a1dca56cf>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment$fragmentType } from "./RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment.graphql";
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery$variables = {};
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery$data = {
  readonly viewer: ?{
    readonly account_user: ?{
      readonly id: string,
    },
  },
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment$fragmentType,
};
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery = {
  response: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery$data,
  variables: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery$variables,
};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "concreteType": "Viewer",
  "kind": "LinkedField",
  "name": "viewer",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "account_user",
      "plural": false,
      "selections": [
        (v0/*:: as any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery",
    "selections": [
      (v1/*:: as any*/),
      {
        "kind": "Defer",
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment"
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery",
    "selections": [
      (v1/*:: as any*/),
      {
        "if": null,
        "kind": "Defer",
        "label": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery$defer$AccountFragment",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Viewer",
            "kind": "LinkedField",
            "name": "viewer",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "account_user",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  },
                  (v0/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "adb3d6603dd9e0d07e07e85fb6ee58f4",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery {\n  viewer {\n    account_user {\n      id\n    }\n  }\n  ...RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment @defer(label: \"RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery$defer$AccountFragment\")\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment on Query {\n  viewer {\n    account_user {\n      name\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "116c53bb0ae98f6c820b390587129bf9";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery$variables,
  RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery$data,
>*/);
