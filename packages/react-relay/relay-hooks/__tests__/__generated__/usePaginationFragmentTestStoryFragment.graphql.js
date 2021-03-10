/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9a7eca7828c45dc5564f51555a4f3612>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
type usePaginationFragmentTestStoryFragment$ref = any;
type usePaginationFragmentTestStoryFragment$fragmentType = any;
export type { usePaginationFragmentTestStoryFragment$ref, usePaginationFragmentTestStoryFragment$fragmentType };
export type usePaginationFragmentTestStoryFragment = {|
  +comments: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
      |},
    |}>,
  |},
  +fetch_id: string,
  +__token: string,
  +$refType: usePaginationFragmentTestStoryFragment$ref,
|};
export type usePaginationFragmentTestStoryFragment$data = usePaginationFragmentTestStoryFragment;
export type usePaginationFragmentTestStoryFragment$key = {
  +$data?: usePaginationFragmentTestStoryFragment$data,
  +$fragmentRefs: usePaginationFragmentTestStoryFragment$ref,
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
      "identifierField": "fetch_id"
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

module.exports = node;
