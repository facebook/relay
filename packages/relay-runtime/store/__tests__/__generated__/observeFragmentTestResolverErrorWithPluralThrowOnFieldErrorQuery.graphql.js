/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dfcea1d1e2935f243015454cfaa6ee52>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment$fragmentType } from "./observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment.graphql";
export type observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorQuery$variables = {||};
export type observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorQuery$data = {|
  +nodes: ?ReadonlyArray<?{|
    +$fragmentSpreads: observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment$fragmentType,
  |}>,
|};
export type observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorQuery = {|
  response: observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorQuery$data,
  variables: observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "ids",
    "value": [
      "7",
      "8"
    ]
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorQuery",
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
            "name": "observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment"
          }
        ],
        "storageKey": "nodes(ids:[\"7\",\"8\"])"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": [
          (v1/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "name": "always_throws",
                "args": null,
                "fragment": {
                  "kind": "InlineFragment",
                  "selections": [
                    (v1/*: any*/)
                  ],
                  "type": "User",
                  "abstractKey": null
                },
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": true
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
        "storageKey": "nodes(ids:[\"7\",\"8\"])"
      }
    ]
  },
  "params": {
    "cacheID": "cda0054b75d8a0bc0abaacbb14186b4a",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorQuery {\n  nodes(ids: [\"7\", \"8\"]) {\n    __typename\n    ...observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment\n    id\n  }\n}\n\nfragment UserAlwaysThrowsResolver on User {\n  __typename\n}\n\nfragment observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment on User {\n  ...UserAlwaysThrowsResolver\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "412492582875c8c7b44e67794ed55763";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorQuery$variables,
  observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorQuery$data,
>*/);
