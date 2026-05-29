/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5d46c9173ea0a507212ca41f5b4a404e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$data = {
  readonly markdown: ?string,
  readonly $fragmentType: RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$fragmentType,
};
export type RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$key = {
  readonly $data?: RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$data,
  readonly $fragmentSpreads: RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$fragmentType,
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
  (node/*:: as any*/).hash = "8c5cb86e103cc3a4b7208e689373c037";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$fragmentType,
  RelayReaderTestWhenMatchDirectiveIsPresentMarkdownUserNameRenderer_name$data,
>*/);
