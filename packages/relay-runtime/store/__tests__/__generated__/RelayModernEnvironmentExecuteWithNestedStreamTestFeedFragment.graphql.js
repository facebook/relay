/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3fa9e266cefc65e3b1a1e7f956d54fe4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$fragmentType: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$ref;
export type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment = {|
  +newsFeed: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +cursor: ?string,
      +node: ?{|
        +id: string,
        +feedback: ?{|
          +actors: ?$ReadOnlyArray<?{|
            +name: ?string,
          |}>,
        |},
      |},
    |}>,
  |},
  +$refType: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$ref,
|};
export type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$data = RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment;
export type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "enableStream"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 10
        }
      ],
      "concreteType": "NewsFeedConnection",
      "kind": "LinkedField",
      "name": "newsFeed",
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
                      "name": "id",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "Feedback",
                      "kind": "LinkedField",
                      "name": "feedback",
                      "plural": false,
                      "selections": [
                        {
                          "kind": "Stream",
                          "selections": [
                            {
                              "alias": null,
                              "args": null,
                              "concreteType": null,
                              "kind": "LinkedField",
                              "name": "actors",
                              "plural": true,
                              "selections": [
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
                          ]
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
        }
      ],
      "storageKey": "newsFeed(first:10)"
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "df9a99d9c87fbf7fdf13ebbd6b8390c6";
}

module.exports = node;
