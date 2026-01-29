/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9bbb9b738ba1d0ecee039582795af39b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTestConditionalFragment$fragmentType } from "./RelayReaderAliasedFragmentsTestConditionalFragment.graphql";
export type RelayReaderAliasedFragmentsTestConditionalQuery$variables = {|
  someCondition: boolean,
|};
export type RelayReaderAliasedFragmentsTestConditionalQuery$data = {|
  +me: ?{|
    +aliased_fragment?: ?{|
      +$fragmentSpreads: RelayReaderAliasedFragmentsTestConditionalFragment$fragmentType,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestConditionalQuery = {|
  response: RelayReaderAliasedFragmentsTestConditionalQuery$data,
  variables: RelayReaderAliasedFragmentsTestConditionalQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "someCondition"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTestConditionalQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "condition": "someCondition",
            "kind": "Condition",
            "passingValue": false,
            "selections": [
              {
                "fragment": {
                  "kind": "InlineFragment",
                  "selections": [
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "RelayReaderAliasedFragmentsTestConditionalFragment"
                    }
                  ],
                  "type": "User",
                  "abstractKey": null
                },
                "kind": "AliasedInlineFragmentSpread",
                "name": "aliased_fragment"
              }
            ]
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
    "name": "RelayReaderAliasedFragmentsTestConditionalQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "condition": "someCondition",
            "kind": "Condition",
            "passingValue": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ]
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
    "cacheID": "f5ba044f54f62ff8f59612bd2e688f9b",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestConditionalQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestConditionalQuery(\n  $someCondition: Boolean!\n) {\n  me {\n    ...RelayReaderAliasedFragmentsTestConditionalFragment @skip(if: $someCondition)\n    id\n  }\n}\n\nfragment RelayReaderAliasedFragmentsTestConditionalFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8a983bb43381d44133495544bf14d58a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestConditionalQuery$variables,
  RelayReaderAliasedFragmentsTestConditionalQuery$data,
>*/);
