/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<10034eb057a199176c4362dd541b97c3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { readInlineDataTestUserFragment$fragmentType } from "./readInlineDataTestUserFragment.graphql";
export type readInlineDataTestUserQuery$variables = {|
  id: string,
|};
export type readInlineDataTestUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: readInlineDataTestUserFragment$fragmentType,
  |},
|};
export type readInlineDataTestUserQuery = {|
  response: readInlineDataTestUserQuery$data,
  variables: readInlineDataTestUserQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "readInlineDataTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineDataFragmentSpread",
            "name": "readInlineDataTestUserFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "type": "User",
                "abstractKey": null
              }
            ],
            "args": null,
            "argumentDefinitions": []
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
    "name": "readInlineDataTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/)
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "2b76a8c37e183b638d8cd251e29c0fa2",
    "id": null,
    "metadata": {},
    "name": "readInlineDataTestUserQuery",
    "operationKind": "query",
    "text": "query readInlineDataTestUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...readInlineDataTestUserFragment\n    id\n  }\n}\n\nfragment readInlineDataTestUserFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "64aaa0bdd963532aa7d5e61221722bca";
}

module.exports = ((node/*: any*/)/*: Query<
  readInlineDataTestUserQuery$variables,
  readInlineDataTestUserQuery$data,
>*/);
