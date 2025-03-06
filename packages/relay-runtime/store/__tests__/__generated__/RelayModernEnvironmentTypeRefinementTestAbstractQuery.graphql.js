/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<85d7cecfc3bb841c247b5d2fd950cab7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$fragmentType } from "./RelayModernEnvironmentTypeRefinementTestAbstractActorFragment.graphql";
import type { RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$fragmentType } from "./RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment.graphql";
export type RelayModernEnvironmentTypeRefinementTestAbstractQuery$variables = {||};
export type RelayModernEnvironmentTypeRefinementTestAbstractQuery$data = {|
  +userOrPage: ?{|
    +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$fragmentType & RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentTypeRefinementTestAbstractQuery = {|
  response: RelayModernEnvironmentTypeRefinementTestAbstractQuery$data,
  variables: RelayModernEnvironmentTypeRefinementTestAbstractQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "abc"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentTypeRefinementTestAbstractQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "userOrPage",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentTypeRefinementTestAbstractActorFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment"
          }
        ],
        "storageKey": "userOrPage(id:\"abc\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentTypeRefinementTestAbstractQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "userOrPage",
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
              (v1/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": "missing",
                "args": null,
                "kind": "ScalarField",
                "name": "lastName",
                "storageKey": null
              }
            ],
            "type": "Actor",
            "abstractKey": "__isActor"
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v1/*: any*/)
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          }
        ],
        "storageKey": "userOrPage(id:\"abc\")"
      }
    ]
  },
  "params": {
    "cacheID": "6342246f34df33da1423c810ef486e58",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentTypeRefinementTestAbstractQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentTypeRefinementTestAbstractQuery {\n  userOrPage(id: \"abc\") {\n    __typename\n    ...RelayModernEnvironmentTypeRefinementTestAbstractActorFragment\n    ...RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentTypeRefinementTestAbstractActorFragment on Actor {\n  __isActor: __typename\n  id\n  name\n  missing: lastName\n}\n\nfragment RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment on Node {\n  __isNode: __typename\n  ... on Actor {\n    __isActor: __typename\n    id\n    name\n    missing: lastName\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8035321d8e2ae9f9cb97b1d0deca22d6";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentTypeRefinementTestAbstractQuery$variables,
  RelayModernEnvironmentTypeRefinementTestAbstractQuery$data,
>*/);
