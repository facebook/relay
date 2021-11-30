/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<52524e0c537afbaaa4c1b8f99cb90521>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$fragmentType = any;
type RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$fragmentType = any;
export type RelayModernEnvironmentTypeRefinementTestConcreteQuery$variables = {||};
export type RelayModernEnvironmentTypeRefinementTestConcreteQueryVariables = RelayModernEnvironmentTypeRefinementTestConcreteQuery$variables;
export type RelayModernEnvironmentTypeRefinementTestConcreteQuery$data = {|
  +userOrPage: ?{|
    +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$fragmentType & RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentTypeRefinementTestConcreteQueryResponse = RelayModernEnvironmentTypeRefinementTestConcreteQuery$data;
export type RelayModernEnvironmentTypeRefinementTestConcreteQuery = {|
  variables: RelayModernEnvironmentTypeRefinementTestConcreteQueryVariables,
  response: RelayModernEnvironmentTypeRefinementTestConcreteQuery$data,
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
    "name": "RelayModernEnvironmentTypeRefinementTestConcreteQuery",
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
            "name": "RelayModernEnvironmentTypeRefinementTestConcreteUserFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment"
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
    "name": "RelayModernEnvironmentTypeRefinementTestConcreteQuery",
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
            "type": "User",
            "abstractKey": null
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
    "cacheID": "948dc18f30d5b785be0e6629fe2feec1",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentTypeRefinementTestConcreteQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentTypeRefinementTestConcreteQuery {\n  userOrPage(id: \"abc\") {\n    __typename\n    ...RelayModernEnvironmentTypeRefinementTestConcreteUserFragment\n    ...RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment on Node {\n  __isNode: __typename\n  ... on User {\n    id\n    name\n    missing: lastName\n  }\n}\n\nfragment RelayModernEnvironmentTypeRefinementTestConcreteUserFragment on User {\n  id\n  name\n  missing: lastName\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "08f8aa409b7c457e4992582d6eb9d7a5";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentTypeRefinementTestConcreteQuery$variables,
  RelayModernEnvironmentTypeRefinementTestConcreteQuery$data,
>*/);
