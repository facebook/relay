/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5ad69a51446ce110cb3c3cca4ca38c8b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { waitForFragmentDataTestOkPluralFragment$fragmentType } from "./waitForFragmentDataTestOkPluralFragment.graphql";
export type waitForFragmentDataTestOkPluralQuery$variables = {||};
export type waitForFragmentDataTestOkPluralQuery$data = {|
  +nodes: ?ReadonlyArray<?{|
    +$fragmentSpreads: waitForFragmentDataTestOkPluralFragment$fragmentType,
  |}>,
|};
export type waitForFragmentDataTestOkPluralQuery = {|
  response: waitForFragmentDataTestOkPluralQuery$data,
  variables: waitForFragmentDataTestOkPluralQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "ids",
    "value": [
      "1",
      "2"
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "waitForFragmentDataTestOkPluralQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "waitForFragmentDataTestOkPluralFragment"
          }
        ],
        "storageKey": "nodes(ids:[\"1\",\"2\"])"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "waitForFragmentDataTestOkPluralQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
        "storageKey": "nodes(ids:[\"1\",\"2\"])"
      }
    ]
  },
  "params": {
    "cacheID": "91c66e0b45b06f9cc7a66477f8156418",
    "id": null,
    "metadata": {},
    "name": "waitForFragmentDataTestOkPluralQuery",
    "operationKind": "query",
    "text": "query waitForFragmentDataTestOkPluralQuery {\n  nodes(ids: [\"1\", \"2\"]) {\n    __typename\n    ...waitForFragmentDataTestOkPluralFragment\n    id\n  }\n}\n\nfragment waitForFragmentDataTestOkPluralFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "139b32cebe816906461147bcb6b1db45";
}

module.exports = ((node/*: any*/)/*: Query<
  waitForFragmentDataTestOkPluralQuery$variables,
  waitForFragmentDataTestOkPluralQuery$data,
>*/);
