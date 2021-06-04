/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0f6745de7d6a127751d7cf4c12ca5ffd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

export type RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$normalization = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
    +id: ?string,
  |},
|};

*/

var node/*: NormalizationSplitOperation*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$cond"
    }
  ],
  "kind": "SplitOperation",
  "metadata": {},
  "name": "RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$normalization",
  "selections": [
    {
      "condition": "RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$cond",
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
      "condition": "RelayModernEnvironmentNoInlineTestModuleMarkdownUserNameRenderer_name$cond",
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
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "id",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ]
};

if (__DEV__) {
  (node/*: any*/).hash = "a27cd82f5213394626d01224a4f6ddf9";
}

module.exports = node;
