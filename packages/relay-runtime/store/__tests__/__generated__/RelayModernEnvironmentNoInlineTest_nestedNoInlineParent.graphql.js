/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<cda3338d599339d3bc257b06fed91d06>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType } from "./RelayModernEnvironmentNoInlineTest_nestedNoInline.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$fragmentType: FragmentType;
export type RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$data = {|
  +joe: ?{|
    +$fragmentSpreads: RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType,
  |},
  +mark: ?{|
    +$fragmentSpreads: RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType,
  |},
  +zuck: ?{|
    +$fragmentSpreads: RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType,
  |},
  +$fragmentType: RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$fragmentType,
|};
export type RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$key = {
  +$data?: RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$data,
  +$fragmentSpreads: RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cond"
    },
    {
      "kind": "RootArgument",
      "name": "global_cond"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentNoInlineTest_nestedNoInlineParent",
  "selections": [
    {
      "alias": "mark",
      "args": [
        {
          "kind": "Literal",
          "name": "name",
          "value": "Mark"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "username",
      "plural": false,
      "selections": [
        {
          "args": [
            {
              "kind": "Variable",
              "name": "cond",
              "variableName": "global_cond"
            }
          ],
          "kind": "FragmentSpread",
          "name": "RelayModernEnvironmentNoInlineTest_nestedNoInline"
        }
      ],
      "storageKey": "username(name:\"Mark\")"
    },
    {
      "alias": "zuck",
      "args": [
        {
          "kind": "Literal",
          "name": "name",
          "value": "Zuck"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "username",
      "plural": false,
      "selections": [
        {
          "args": [
            {
              "kind": "Literal",
              "name": "cond",
              "value": false
            }
          ],
          "kind": "FragmentSpread",
          "name": "RelayModernEnvironmentNoInlineTest_nestedNoInline"
        }
      ],
      "storageKey": "username(name:\"Zuck\")"
    },
    {
      "alias": "joe",
      "args": [
        {
          "kind": "Literal",
          "name": "name",
          "value": "Joe"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "username",
      "plural": false,
      "selections": [
        {
          "args": [
            {
              "kind": "Variable",
              "name": "cond",
              "variableName": "cond"
            }
          ],
          "kind": "FragmentSpread",
          "name": "RelayModernEnvironmentNoInlineTest_nestedNoInline"
        }
      ],
      "storageKey": "username(name:\"Joe\")"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "80e0fda8b8d8bb4e7200ea5387229c4c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$fragmentType,
  RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$data,
>*/);
