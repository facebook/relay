/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<519b36209a60e31591e6d4e58c67befa>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$fragmentType: FragmentType;
export type RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$ref = RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$fragmentType;
export type RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$data = {|
  +mark: ?{|
    +$fragmentSpreads: RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType,
  |},
  +zuck: ?{|
    +$fragmentSpreads: RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType,
  |},
  +joe: ?{|
    +$fragmentSpreads: RelayModernEnvironmentNoInlineTest_nestedNoInline$fragmentType,
  |},
  +$fragmentType: RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$fragmentType,
|};
export type RelayModernEnvironmentNoInlineTest_nestedNoInlineParent = RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$data;
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
  (node/*: any*/).hash = "d674bb7d0e482ecdd681a2e8574ff5fe";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$fragmentType,
  RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$data,
>*/);
