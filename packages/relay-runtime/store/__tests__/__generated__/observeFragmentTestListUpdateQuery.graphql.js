/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f13ccd2b340343c11041d676a51c7fef>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestListUpdateFragment$fragmentType } from "./observeFragmentTestListUpdateFragment.graphql";
export type observeFragmentTestListUpdateQuery$variables = {||};
export type observeFragmentTestListUpdateQuery$data = {|
  +nodes: ?ReadonlyArray<?{|
    +$fragmentSpreads: observeFragmentTestListUpdateFragment$fragmentType,
  |}>,
|};
export type observeFragmentTestListUpdateQuery = {|
  response: observeFragmentTestListUpdateQuery$data,
  variables: observeFragmentTestListUpdateQuery$variables,
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
    "name": "observeFragmentTestListUpdateQuery",
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
            "name": "observeFragmentTestListUpdateFragment"
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
    "name": "observeFragmentTestListUpdateQuery",
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
    "cacheID": "17a222c7e13bc4a3b9c0c108377514da",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestListUpdateQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestListUpdateQuery {\n  nodes(ids: [\"1\", \"2\"]) {\n    __typename\n    ...observeFragmentTestListUpdateFragment\n    id\n  }\n}\n\nfragment observeFragmentTestListUpdateFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "493ccdbc127bfccc347fc16107f21b79";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestListUpdateQuery$variables,
  observeFragmentTestListUpdateQuery$data,
>*/);
