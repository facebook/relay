/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4ab3456a460190f324a10706a1099699>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestPluralFragment$fragmentType } from "./observeFragmentTestPluralFragment.graphql";
export type observeFragmentTestPluralQuery$variables = {||};
export type observeFragmentTestPluralQuery$data = {|
  +nodes: ?ReadonlyArray<?{|
    +$fragmentSpreads: observeFragmentTestPluralFragment$fragmentType,
  |}>,
|};
export type observeFragmentTestPluralQuery = {|
  response: observeFragmentTestPluralQuery$data,
  variables: observeFragmentTestPluralQuery$variables,
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
    "name": "observeFragmentTestPluralQuery",
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
            "name": "observeFragmentTestPluralFragment"
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
    "name": "observeFragmentTestPluralQuery",
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
    "cacheID": "ccff1412490c5e62d70031d41db0c7e4",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestPluralQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestPluralQuery {\n  nodes(ids: [\"1\", \"2\"]) {\n    __typename\n    ...observeFragmentTestPluralFragment\n    id\n  }\n}\n\nfragment observeFragmentTestPluralFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c1a2f68df2ec25bc00b077d6cdecdce4";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestPluralQuery$variables,
  observeFragmentTestPluralQuery$data,
>*/);
