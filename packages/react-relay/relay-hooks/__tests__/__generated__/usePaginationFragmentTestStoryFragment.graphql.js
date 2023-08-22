/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<78d2548c61fb6ef49166b87871b6e52c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type usePaginationFragmentTestStoryFragment$fragmentType: FragmentType;
type usePaginationFragmentTestStoryFragmentRefetchQuery$variables = any;
export type usePaginationFragmentTestStoryFragment$data = {|
  +__token: string,
  +comments: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
      |},
    |}>,
  |},
  +fetch_id: string,
  +$fragmentType: usePaginationFragmentTestStoryFragment$fragmentType,
|};
export type usePaginationFragmentTestStoryFragment$key = {
  +$data?: usePaginationFragmentTestStoryFragment$data,
  +$fragmentSpreads: usePaginationFragmentTestStoryFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = [
  "comments"
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": 10,
      "kind": "LocalArgument",
      "name": "count"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cursor"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "count",
        "cursor": "cursor",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "count",
          "cursor": "cursor"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [
        "fetch__NonNodeStory"
      ],
      "operation": require('./usePaginationFragmentTestStoryFragmentRefetchQuery.graphql'),
      "identifierInfo": {
        "identifierField": "fetch_id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "usePaginationFragmentTestStoryFragment",
  "selections": [
    {
      "alias": "comments",
      "args": null,
      "concreteType": "CommentsConnection",
      "kind": "LinkedField",
      "name": "__StoryFragment_comments_connection",
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
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "id",
                  "storageKey": null
                },
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
    }
  ],
  "type": "NonNodeStory",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f32695b1b41c05ed8de7a6abfa8583a0";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  usePaginationFragmentTestStoryFragment$fragmentType,
  usePaginationFragmentTestStoryFragment$data,
  usePaginationFragmentTestStoryFragmentRefetchQuery$variables,
>*/);
