/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e985e8ea25fda26662633fbeb19bf16e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTest_user$fragmentType } from "./RelayReaderAliasedFragmentsTest_user.graphql";
export type RelayReaderAliasedFragmentsTest3Query$variables = {|
  id: string,
|};
export type RelayReaderAliasedFragmentsTest3Query$data = {|
  +node: ?{|
    +aliased_fragment: ?{|
      +$fragmentSpreads: RelayReaderAliasedFragmentsTest_user$fragmentType,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTest3Query = {|
  response: RelayReaderAliasedFragmentsTest3Query$data,
  variables: RelayReaderAliasedFragmentsTest3Query$variables,
|};
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTest3Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "RelayReaderAliasedFragmentsTest_user"
                }
              ],
              "type": "User",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "aliased_fragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayReaderAliasedFragmentsTest3Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
    "cacheID": "55da284ca6e963492cb63a15c596aa1e",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTest3Query",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTest3Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayReaderAliasedFragmentsTest_user\n    id\n  }\n}\n\nfragment RelayReaderAliasedFragmentsTest_user on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e13d65c9122b09b01e831a8af139d5cd";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTest3Query$variables,
  RelayReaderAliasedFragmentsTest3Query$data,
>*/);
