/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9fffcbe38e33759a5bc18e10477723c3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$ref = RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$fragmentType;
export type RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$data = {|
  +markdown?: ?string,
  +data?: ?{|
    +markup: ?string,
  |},
  +$refType: RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$fragmentType,
  +$fragmentType: RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name = RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$data;
export type RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$data,
  +$fragmentRefs: RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$fragmentType,
  +$fragmentSpreads: RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cond"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name",
  "selections": [
    {
      "condition": "cond",
      "kind": "Condition",
      "passingValue": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "markdown",
          "storageKey": null
        }
      ]
    },
    {
      "condition": "cond",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "MarkdownUserNameData",
          "kind": "LinkedField",
          "name": "data",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "markup",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "a27cd82f5213394626d01224a4f6ddf9";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$data,
>*/);
