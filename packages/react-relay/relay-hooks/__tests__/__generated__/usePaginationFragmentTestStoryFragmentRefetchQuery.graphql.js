/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b0c9e886d9c69cbaeaa26156a82e1d03>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
type usePaginationFragmentTestStoryFragment$fragmentType = any;
export type usePaginationFragmentTestStoryFragmentRefetchQuery$variables = {|
  count?: ?number,
  cursor?: ?string,
  id: string,
|};
export type usePaginationFragmentTestStoryFragmentRefetchQueryVariables = usePaginationFragmentTestStoryFragmentRefetchQuery$variables;
export type usePaginationFragmentTestStoryFragmentRefetchQuery$data = {|
  +fetch__NonNodeStory: ?{|
    +$fragmentSpreads: usePaginationFragmentTestStoryFragment$fragmentType,
  |},
|};
export type usePaginationFragmentTestStoryFragmentRefetchQueryResponse = usePaginationFragmentTestStoryFragmentRefetchQuery$data;
export type usePaginationFragmentTestStoryFragmentRefetchQuery = {|
  variables: usePaginationFragmentTestStoryFragmentRefetchQueryVariables,
  response: usePaginationFragmentTestStoryFragmentRefetchQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": 10,
    "kind": "LocalArgument",
    "name": "count"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cursor"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input_fetch_id",
    "variableName": "id"
  }
],
v2 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
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
    "name": "usePaginationFragmentTestStoryFragmentRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "NonNodeStory",
        "kind": "LinkedField",
        "name": "fetch__NonNodeStory",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Variable",
                "name": "count",
                "variableName": "count"
              },
              {
                "kind": "Variable",
                "name": "cursor",
                "variableName": "cursor"
              }
            ],
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
    "name": "usePaginationFragmentTestStoryFragmentRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "NonNodeStory",
        "kind": "LinkedField",
        "name": "fetch__NonNodeStory",
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
            "storageKey": null
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
    "cacheID": "141601b4d00333b2f388709fff638ee6",
    "id": null,
    "metadata": {},
    "name": "usePaginationFragmentTestStoryFragmentRefetchQuery",
    "operationKind": "query",
    "text": "query usePaginationFragmentTestStoryFragmentRefetchQuery(\n  $count: Int = 10\n  $cursor: ID\n  $id: ID!\n) {\n  fetch__NonNodeStory(input_fetch_id: $id) {\n    ...usePaginationFragmentTestStoryFragment_1G22uz\n    id\n  }\n}\n\nfragment usePaginationFragmentTestStoryFragment_1G22uz on NonNodeStory {\n  comments(first: $count, after: $cursor) {\n    edges {\n      node {\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  fetch_id\n  __token\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f32695b1b41c05ed8de7a6abfa8583a0";
}

module.exports = ((node/*: any*/)/*: Query<
  usePaginationFragmentTestStoryFragmentRefetchQuery$variables,
  usePaginationFragmentTestStoryFragmentRefetchQuery$data,
>*/);
