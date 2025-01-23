/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<70e8d3e11aa27a34d595ac1f1215d8fc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderAliasedFragmentsTestAliasedInlineFragmentWithoutTypeConditionQuery$variables = {||};
export type RelayReaderAliasedFragmentsTestAliasedInlineFragmentWithoutTypeConditionQuery$data = {|
  +me: ?{|
    +aliased_fragment: ?{|
      +name: string,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestAliasedInlineFragmentWithoutTypeConditionQuery = {|
  response: RelayReaderAliasedFragmentsTestAliasedInlineFragmentWithoutTypeConditionQuery$data,
  variables: RelayReaderAliasedFragmentsTestAliasedInlineFragmentWithoutTypeConditionQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTestAliasedInlineFragmentWithoutTypeConditionQuery",
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
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "kind": "RequiredField",
                  "field": (v0/*: any*/),
                  "action": "NONE"
                }
              ],
              "type": null,
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderAliasedFragmentsTestAliasedInlineFragmentWithoutTypeConditionQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
    "cacheID": "4cc950c6ab6ecce0af2e58e9ebbe882a",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestAliasedInlineFragmentWithoutTypeConditionQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestAliasedInlineFragmentWithoutTypeConditionQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2e11b67dd1bbc6f668f878ea40e358e7";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestAliasedInlineFragmentWithoutTypeConditionQuery$variables,
  RelayReaderAliasedFragmentsTestAliasedInlineFragmentWithoutTypeConditionQuery$data,
>*/);
