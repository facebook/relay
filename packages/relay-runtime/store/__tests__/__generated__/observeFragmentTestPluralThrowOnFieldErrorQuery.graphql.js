/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<617f842411395095bf307ceb5e8f7bf6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestPluralThrowOnFieldErrorFragment$fragmentType } from "./observeFragmentTestPluralThrowOnFieldErrorFragment.graphql";
export type observeFragmentTestPluralThrowOnFieldErrorQuery$variables = {||};
export type observeFragmentTestPluralThrowOnFieldErrorQuery$data = {|
  +nodes: ?ReadonlyArray<?{|
    +$fragmentSpreads: observeFragmentTestPluralThrowOnFieldErrorFragment$fragmentType,
  |}>,
|};
export type observeFragmentTestPluralThrowOnFieldErrorQuery = {|
  response: observeFragmentTestPluralThrowOnFieldErrorQuery$data,
  variables: observeFragmentTestPluralThrowOnFieldErrorQuery$variables,
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
    "name": "observeFragmentTestPluralThrowOnFieldErrorQuery",
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
            "name": "observeFragmentTestPluralThrowOnFieldErrorFragment"
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
    "name": "observeFragmentTestPluralThrowOnFieldErrorQuery",
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
    "cacheID": "1e83abfe97b66be09a6642b3332e4d09",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestPluralThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestPluralThrowOnFieldErrorQuery {\n  nodes(ids: [\"1\", \"2\"]) {\n    __typename\n    ...observeFragmentTestPluralThrowOnFieldErrorFragment\n    id\n  }\n}\n\nfragment observeFragmentTestPluralThrowOnFieldErrorFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "36cd146fd2db4ac80dfe226a3e20dd3e";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestPluralThrowOnFieldErrorQuery$variables,
  observeFragmentTestPluralThrowOnFieldErrorQuery$data,
>*/);
