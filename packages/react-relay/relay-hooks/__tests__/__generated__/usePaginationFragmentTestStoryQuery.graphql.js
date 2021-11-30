/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<86ff04d21e522c11c897e387dc35403b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type usePaginationFragmentTestStoryFragment$fragmentType = any;
export type usePaginationFragmentTestStoryQuery$variables = {|
  id: string,
|};
export type usePaginationFragmentTestStoryQueryVariables = usePaginationFragmentTestStoryQuery$variables;
export type usePaginationFragmentTestStoryQuery$data = {|
  +nonNodeStory: ?{|
    +$fragmentSpreads: usePaginationFragmentTestStoryFragment$fragmentType,
  |},
|};
export type usePaginationFragmentTestStoryQueryResponse = usePaginationFragmentTestStoryQuery$data;
export type usePaginationFragmentTestStoryQuery = {|
  variables: usePaginationFragmentTestStoryQueryVariables,
  response: usePaginationFragmentTestStoryQuery$data,
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
v2 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "usePaginationFragmentTestStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "NonNodeStory",
        "kind": "LinkedField",
        "name": "nonNodeStory",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "usePaginationFragmentTestStoryFragment"
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
    "name": "usePaginationFragmentTestStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "NonNodeStory",
        "kind": "LinkedField",
        "name": "nonNodeStory",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "CommentsConnection",
            "kind": "LinkedField",
            "name": "comments",
            "plural": false,
            "selections": [
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
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cursor",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PageInfo",
                "kind": "LinkedField",
                "name": "pageInfo",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "endCursor",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "hasNextPage",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "comments(first:10)"
          },
          {
            "alias": null,
            "args": (v2/*: any*/),
            "filters": null,
            "handle": "connection",
            "key": "StoryFragment_comments",
            "kind": "LinkedHandle",
            "name": "comments"
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "fetch_id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__token",
            "storageKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4f3e70176552d390bebe4d2886c17745",
    "id": null,
    "metadata": {},
    "name": "usePaginationFragmentTestStoryQuery",
    "operationKind": "query",
    "text": "query usePaginationFragmentTestStoryQuery(\n  $id: ID!\n) {\n  nonNodeStory(id: $id) {\n    ...usePaginationFragmentTestStoryFragment\n    id\n  }\n}\n\nfragment usePaginationFragmentTestStoryFragment on NonNodeStory {\n  comments(first: 10) {\n    edges {\n      node {\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  fetch_id\n  __token\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "58177aa39d1e95877117557290be91a1";
}

module.exports = ((node/*: any*/)/*: Query<
  usePaginationFragmentTestStoryQuery$variables,
  usePaginationFragmentTestStoryQuery$data,
>*/);
