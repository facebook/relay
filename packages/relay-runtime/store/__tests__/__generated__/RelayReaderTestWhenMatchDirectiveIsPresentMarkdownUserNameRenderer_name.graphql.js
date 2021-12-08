/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3d3ce2da956cc1e8772a5955e36dece6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$ref = RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$fragmentType;
export type RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$data = {|
  +markdown: ?string,
  +$fragmentType: RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name = RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$data;
export type RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$key = {
  +$data?: RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "8c5cb86e103cc3a4b7208e689373c037";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$fragmentType,
  RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$data,
>*/);
