/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<15c75b3d47e9a8fe8d34b014195b3b3f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$data = {|
  +newsFeed: ?{|
    +edges: ?ReadonlyArray<?{|
      +cursor: ?string,
      +node: ?{|
        +feedback: ?{|
          +actors: ?ReadonlyArray<?{|
            +name: ?string,
          |}>,
        |},
        +id: string,
      |},
    |}>,
  |},
  +$fragmentType: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$fragmentType,
  RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$data,
>*/);
