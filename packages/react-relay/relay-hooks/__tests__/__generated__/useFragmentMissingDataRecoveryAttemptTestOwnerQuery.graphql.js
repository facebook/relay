/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ab6b9bf33672605ec27e386d384a6568>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useFragmentMissingDataRecoveryAttemptTestSiblingFragment$fragmentType } from "./useFragmentMissingDataRecoveryAttemptTestSiblingFragment.graphql";
import type { useFragmentMissingDataRecoveryAttemptTestUserFragment$fragmentType } from "./useFragmentMissingDataRecoveryAttemptTestUserFragment.graphql";
export type useFragmentMissingDataRecoveryAttemptTestOwnerQuery$variables = {
  id: string,
};
export type useFragmentMissingDataRecoveryAttemptTestOwnerQuery$data = {
  readonly node: ?{
    readonly $fragmentSpreads: useFragmentMissingDataRecoveryAttemptTestSiblingFragment$fragmentType & useFragmentMissingDataRecoveryAttemptTestUserFragment$fragmentType,
  },
};
export type useFragmentMissingDataRecoveryAttemptTestOwnerQuery = {
  response: useFragmentMissingDataRecoveryAttemptTestOwnerQuery$data,
  variables: useFragmentMissingDataRecoveryAttemptTestOwnerQuery$variables,
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
    "name": "useFragmentMissingDataRecoveryAttemptTestOwnerQuery",
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
            "name": "useFragmentMissingDataRecoveryAttemptTestUserFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useFragmentMissingDataRecoveryAttemptTestSiblingFragment"
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
    "name": "useFragmentMissingDataRecoveryAttemptTestOwnerQuery",
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
    "cacheID": "c3ede778067fa11d72bd4b58785f9b29",
    "id": null,
    "metadata": {},
    "name": "useFragmentMissingDataRecoveryAttemptTestOwnerQuery",
    "operationKind": "query",
    "text": "query useFragmentMissingDataRecoveryAttemptTestOwnerQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useFragmentMissingDataRecoveryAttemptTestUserFragment\n    ...useFragmentMissingDataRecoveryAttemptTestSiblingFragment\n    id\n  }\n}\n\nfragment useFragmentMissingDataRecoveryAttemptTestSiblingFragment on User {\n  name\n}\n\nfragment useFragmentMissingDataRecoveryAttemptTestUserFragment on User {\n  name\n  birthdate {\n    day\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "e92843ce6c00f8297f6e6b1d88c75ba6";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  useFragmentMissingDataRecoveryAttemptTestOwnerQuery$variables,
  useFragmentMissingDataRecoveryAttemptTestOwnerQuery$data,
>*/);
