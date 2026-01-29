/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<aa0b69ffd74418641d1b374820b11672>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$fragmentType: FragmentType;
export type RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$data = {|
  +newsFeed: ?{|
    +edges: ?ReadonlyArray<?{|
      +node: ?{|
        +feedback?: ?{|
          +author: ?{|
            +name: ?string,
          |},
        |},
      |},
    |}>,
  |},
  +$fragmentType: RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$fragmentType,
|};
export type RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$key = {
  +$data?: RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$data,
  +$fragmentSpreads: RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": true,
      "kind": "LocalArgument",
      "name": "cond"
    },
    {
      "defaultValue": false,
      "kind": "LocalArgument",
      "name": "enableStream"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 2
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
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    {
                      "condition": "cond",
                      "kind": "Condition",
                      "passingValue": true,
                      "selections": [
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "Feedback",
                          "kind": "LinkedField",
                          "name": "feedback",
                          "plural": false,
                          "selections": [
                            {
                              "alias": null,
                              "args": null,
                              "concreteType": "User",
                              "kind": "LinkedField",
                              "name": "author",
                              "plural": false,
                              "selections": [
                                {
                                  "alias": null,
                                  "args": null,
                                  "kind": "ScalarField",
                                  "name": "name",
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
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ]
        }
      ],
      "storageKey": "newsFeed(first:2)"
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "a7455d1924444ac117790f34dbd90cec";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$fragmentType,
  RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$data,
>*/);
