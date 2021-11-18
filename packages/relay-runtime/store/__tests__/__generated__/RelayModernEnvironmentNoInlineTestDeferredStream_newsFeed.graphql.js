/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fd890430958341a9deb042d938fd54a2>>
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
export type RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$ref = RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$fragmentType;
export type RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$data = {|
  +newsFeed: ?{|
    +edges: ?$ReadOnlyArray<?{|
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
export type RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed = RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$data;
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
