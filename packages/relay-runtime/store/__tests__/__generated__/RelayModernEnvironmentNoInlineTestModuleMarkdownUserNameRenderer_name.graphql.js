/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bb9da10562b2ea2d1a8857890da5d26c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$fragmentType: RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$ref;
export type RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name = {|
  +markdown?: ?string,
  +data?: ?{|
    +markup: ?string,
  |},
  +$refType: RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$ref,
|};
export type RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$data = RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name;
export type RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$data,
  +$fragmentRefs: RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$ref,
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

module.exports = node;
