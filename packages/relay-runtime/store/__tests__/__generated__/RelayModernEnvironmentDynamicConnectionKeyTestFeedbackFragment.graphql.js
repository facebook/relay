/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<525b33ce843f84320de0fc2e15a7ba55>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment$fragmentType: RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment$ref;
export type RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment = {|
  +id: string,
  +comments: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
      |},
    |}>,
  |},
  +$refType: RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment$ref,
|};
export type RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment$data = RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment;
export type RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment$key = {
  +$data?: RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment$data,
  +$fragmentRefs: RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "commentsKey"
    },
    {
      "defaultValue": 2,
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
        "path": [
          "comments"
        ]
      }
    ]
  },
  "name": "RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": "comments",
      "args": [
        {
          "kind": "Variable",
          "name": "__dynamicKey",
          "variableName": "commentsKey"
        },
        {
          "kind": "Literal",
          "name": "orderby",
          "value": "date"
        }
      ],
      "concreteType": "CommentsConnection",
      "kind": "LinkedField",
      "name": "__RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment_comments_connection",
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
                (v0/*: any*/),
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
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b83415f7ddaf726ca9c8853aa433bf33";
}

module.exports = node;
