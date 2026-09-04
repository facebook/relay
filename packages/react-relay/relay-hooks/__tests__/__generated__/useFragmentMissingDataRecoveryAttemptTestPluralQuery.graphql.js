/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<43e97202f458ae5b45416ed04c23671d>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useFragmentMissingDataRecoveryAttemptTestPluralFragment$fragmentType } from "./useFragmentMissingDataRecoveryAttemptTestPluralFragment.graphql";
export type useFragmentMissingDataRecoveryAttemptTestPluralQuery$variables = {
  ids?: ?ReadonlyArray<string>,
};
export type useFragmentMissingDataRecoveryAttemptTestPluralQuery$data = {
  readonly nodes: ?ReadonlyArray<?{
    readonly $fragmentSpreads: useFragmentMissingDataRecoveryAttemptTestPluralFragment$fragmentType,
  }>,
};
export type useFragmentMissingDataRecoveryAttemptTestPluralQuery = {
  response: useFragmentMissingDataRecoveryAttemptTestPluralQuery$data,
  variables: useFragmentMissingDataRecoveryAttemptTestPluralQuery$variables,
};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "ids"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "ids",
    "variableName": "ids"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useFragmentMissingDataRecoveryAttemptTestPluralQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useFragmentMissingDataRecoveryAttemptTestPluralFragment"
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
    "name": "useFragmentMissingDataRecoveryAttemptTestPluralQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
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
    "cacheID": "d39de45cc485952e266f0d36a5b344a3",
    "id": null,
    "metadata": {},
    "name": "useFragmentMissingDataRecoveryAttemptTestPluralQuery",
    "operationKind": "query",
    "text": "query useFragmentMissingDataRecoveryAttemptTestPluralQuery(\n  $ids: [ID!]\n) {\n  nodes(ids: $ids) {\n    __typename\n    ...useFragmentMissingDataRecoveryAttemptTestPluralFragment\n    id\n  }\n}\n\nfragment useFragmentMissingDataRecoveryAttemptTestPluralFragment on User {\n  name\n  birthdate {\n    day\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "8f8f63b9fac3b8c44c432c61952f6940";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  useFragmentMissingDataRecoveryAttemptTestPluralQuery$variables,
  useFragmentMissingDataRecoveryAttemptTestPluralQuery$data,
>*/);
