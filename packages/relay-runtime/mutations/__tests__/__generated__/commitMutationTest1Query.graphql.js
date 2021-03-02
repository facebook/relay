/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1c3687068d13d087d1c3f8160efdf7a7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type commitMutationTest1QueryVariables = {||};
export type commitMutationTest1QueryResponse = {|
  +node: ?{|
    +topLevelComments?: ?{|
      +count: ?number,
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +id: string,
        |},
      |}>,
    |},
  |},
|};
export type commitMutationTest1Query = {|
  variables: commitMutationTest1QueryVariables,
  response: commitMutationTest1QueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "feedback123"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 2
        }
      ],
      "concreteType": "TopLevelCommentsConnection",
      "kind": "LinkedField",
      "name": "topLevelComments",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "count",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "CommentsEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Comment",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v1/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "topLevelComments(first:2)"
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "commitMutationTest1Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": "node(id:\"feedback123\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "commitMutationTest1Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
          (v1/*: any*/)
        ],
        "storageKey": "node(id:\"feedback123\")"
      }
    ]
  },
  "params": {
    "cacheID": "dfdf1fd6ec286130ebdb2be78f48e64c",
    "id": null,
    "metadata": {},
    "name": "commitMutationTest1Query",
    "operationKind": "query",
    "text": "query commitMutationTest1Query {\n  node(id: \"feedback123\") {\n    __typename\n    ... on Feedback {\n      topLevelComments(first: 2) {\n        count\n        edges {\n          node {\n            id\n          }\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "57da559c7efe4ad6791cf298e57f2192";
}

module.exports = node;
