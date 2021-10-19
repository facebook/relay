/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7fab0fffdf45aaa49341c42ce46740d8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$fragmentType: RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$ref;
export type RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment = ?{|
  +id: string,
  +comments: {|
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
      |},
    |}>,
  |},
  +$refType: RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$ref,
|};
export type RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$data = RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment;
export type RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$key = {
  +$data?: RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$data,
  +$fragmentRefs: RelayModernEnvironmentConnectionAndRequiredTestFeedbackFragment$ref,
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
      "action": "LOG",
      "path": "comments"
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bccfa87744c99b7482a52d28d18716d0";
}

module.exports = node;
