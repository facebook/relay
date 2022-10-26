/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6636d9f4d844cde43717f65b00d7cd82>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$data = {|
  +markdown: ?string,
  +$fragmentType: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$key = {
  +$data?: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "markdown",
      "storageKey": null
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "b651d2b759885477d679d5d4fb39bcc8";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$fragmentType,
  RelayReaderTestWhenMatchDirectiveIsPresentNoModuleMarkdownUserNameRenderer_name$data,
>*/);
