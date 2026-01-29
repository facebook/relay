/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0f640049dafa704f8202e8830d20099d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestMissingRequiredPluralFragment$fragmentType } from "./observeFragmentTestMissingRequiredPluralFragment.graphql";
export type observeFragmentTestMissingRequiredPluralQuery$variables = {||};
export type observeFragmentTestMissingRequiredPluralQuery$data = {|
  +nodes: ?ReadonlyArray<?{|
    +$fragmentSpreads: observeFragmentTestMissingRequiredPluralFragment$fragmentType,
  |}>,
|};
export type observeFragmentTestMissingRequiredPluralQuery = {|
  response: observeFragmentTestMissingRequiredPluralQuery$data,
  variables: observeFragmentTestMissingRequiredPluralQuery$variables,
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
    "name": "observeFragmentTestMissingRequiredPluralQuery",
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
            "name": "observeFragmentTestMissingRequiredPluralFragment"
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
    "name": "observeFragmentTestMissingRequiredPluralQuery",
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
    "cacheID": "d1213ecc01790c61de1e12d97a40c349",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestMissingRequiredPluralQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestMissingRequiredPluralQuery {\n  nodes(ids: [\"1\", \"2\"]) {\n    __typename\n    ...observeFragmentTestMissingRequiredPluralFragment\n    id\n  }\n}\n\nfragment observeFragmentTestMissingRequiredPluralFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1eb9c5256c37c4d0e28695bb4dd64fa8";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestMissingRequiredPluralQuery$variables,
  observeFragmentTestMissingRequiredPluralQuery$data,
>*/);
