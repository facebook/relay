/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8eb2d33cbcfe7f66ddb4b4f401134637>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTestConditionalFragment$fragmentType } from "./RelayReaderAliasedFragmentsTestConditionalFragment.graphql";
export type RelayReaderAliasedFragmentsTestConditional2Query$variables = {|
  someCondition: boolean,
|};
export type RelayReaderAliasedFragmentsTestConditional2Query$data = {|
  +me: ?{|
    +aliased_fragment?: ?{|
      +$fragmentSpreads: RelayReaderAliasedFragmentsTestConditionalFragment$fragmentType,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestConditional2Query = {|
  response: RelayReaderAliasedFragmentsTestConditional2Query$data,
  variables: RelayReaderAliasedFragmentsTestConditional2Query$variables,
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
    "name": "RelayReaderAliasedFragmentsTestConditional2Query",
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
    "name": "RelayReaderAliasedFragmentsTestConditional2Query",
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
    "cacheID": "e8cfb317c8a012b383b7012a00d99efd",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestConditional2Query",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestConditional2Query(\n  $someCondition: Boolean!\n) {\n  me {\n    ...RelayReaderAliasedFragmentsTestConditionalFragment @skip(if: $someCondition)\n    id\n  }\n}\n\nfragment RelayReaderAliasedFragmentsTestConditionalFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "74cc4a7c44594fd9bd8ba6862c83a664";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestConditional2Query$variables,
  RelayReaderAliasedFragmentsTestConditional2Query$data,
>*/);
