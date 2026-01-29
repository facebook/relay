/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dc7877c6daa4fb027e333a8c7f19b735>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$data = ?{|
  +comments: {|
    +edges: ?ReadonlyArray<?{|
      +node: ?{|
        +id: string,
      |},
    |}>,
  |},
  +id: string,
  +$fragmentType: RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$fragmentType,
|};
export type RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$key = {
  +$data?: RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$fragmentType,
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
  "name": "RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment",
  "selections": [
    (v0/*: any*/),
    {
      "kind": "RequiredField",
      "field": {
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
        "name": "__RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment_comments_connection",
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
        "storageKey": "__RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment_comments_connection(orderby:\"date\")"
      },
      "action": "LOG"
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bccfa87744c99b7482a52d28d18716d0";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$fragmentType,
  RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$data,
>*/);
