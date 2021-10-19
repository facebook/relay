/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<261db3861a500959f79f8679f059c6d4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$fragmentType: RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$ref;
export type RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment = {|
  +newsFeed: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +cursor: ?string,
      +node: ?{|
        +__typename: string,
        +id: string,
        +feedback: ?{|
          +id: string,
          +actors: ?$ReadOnlyArray<?{|
            +id: string,
            +name: ?string,
          |}>,
        |},
      |},
    |}>,
    +pageInfo: ?{|
      +endCursor: ?string,
      +hasNextPage: ?boolean,
    |},
  |},
  +$refType: RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$ref,
|};
export type RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$data = RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment;
export type RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$ref,
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
      "name": "after"
    },
    {
      "kind": "RootArgument",
      "name": "enableStream"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": null,
        "cursor": "after",
        "direction": "forward",
        "path": [
          "newsFeed"
        ],
        "stream": true
      }
    ]
  },
  "name": "RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment",
  "selections": [
    {
      "alias": "newsFeed",
      "args": null,
      "concreteType": "NewsFeedConnection",
      "kind": "LinkedField",
      "name": "__RelayModernEnvironment_newsFeed_connection",
      "plural": false,
      "selections": [
        {
          "kind": "Stream",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "NewsFeedEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "cursor",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
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
                    (v0/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "Feedback",
                      "kind": "LinkedField",
                      "name": "feedback",
                      "plural": false,
                      "selections": [
                        (v0/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": null,
                          "kind": "LinkedField",
                          "name": "actors",
                          "plural": true,
                          "selections": [
                            (v0/*: any*/),
                            {
                              "alias": "name",
                              "args": null,
                              "kind": "ScalarField",
                              "name": "__name_name_handler",
                              "storageKey": null
                            }
                          ],
                          "storageKey": null
                        }
                      ],
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ]
        },
        {
          "kind": "Defer",
          "selections": [
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
          ]
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "89c54479a6a4b0bcce2086df209a357f";
}

module.exports = node;
