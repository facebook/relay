/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<68b5e8e292e783cbf56cb06aa065993f>>
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
export type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$ref = RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$fragmentType;
export type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$data = {|
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
  +$refType: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment = RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$data;
export type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$fragmentType,
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
