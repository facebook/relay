/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dd1eb3fe52b9eb43d2a523510abfa009>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$data = {
  readonly newsFeed: ?{
    readonly edges: ?ReadonlyArray<?{
      readonly cursor: ?string,
      readonly node: ?{
        readonly feedback: ?{
          readonly actors: ?ReadonlyArray<?{
            readonly name: ?string,
          }>,
        },
        readonly id: string,
      },
    }>,
  },
  readonly $fragmentType: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$fragmentType,
};
export type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$fragmentType,
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
  (node/*:: as any*/).hash = "df9a99d9c87fbf7fdf13ebbd6b8390c6";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$fragmentType,
  RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$data,
>*/);
