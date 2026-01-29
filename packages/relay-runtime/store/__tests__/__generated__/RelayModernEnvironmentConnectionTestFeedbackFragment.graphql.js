/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4cd3484b9e7b28a7fa9e7ad6535d2db9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentConnectionTestFeedbackFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentConnectionTestFeedbackFragment$data = {|
  +comments: ?{|
    +edges: ?ReadonlyArray<?{|
      +node: ?{|
        +id: string,
      |},
    |}>,
  |},
  +id: string,
  +$fragmentType: RelayModernEnvironmentConnectionTestFeedbackFragment$fragmentType,
|};
export type RelayModernEnvironmentConnectionTestFeedbackFragment$key = {
  +$data?: RelayModernEnvironmentConnectionTestFeedbackFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentConnectionTestFeedbackFragment$fragmentType,
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
  "name": "RelayModernEnvironmentConnectionTestFeedbackFragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": "comments",
      "args": [
        {
          "kind": "Literal",
          "name": "orderby",
          "value": "date"
        }
      ],
      "concreteType": "CommentsConnection",
      "kind": "LinkedField",
      "name": "__RelayModernEnvironmentConnectionTestFeedbackFragment_comments_connection",
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
      "storageKey": "__RelayModernEnvironmentConnectionTestFeedbackFragment_comments_connection(orderby:\"date\")"
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6a6fe53cc698ac1f973097ed1343a2a3";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentConnectionTestFeedbackFragment$fragmentType,
  RelayModernEnvironmentConnectionTestFeedbackFragment$data,
>*/);
