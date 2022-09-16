/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a35953a33a7b46173fb991393f17b6ae>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$data = {|
  +data: ?{|
    +markup: ?string,
  |},
  +markdown: ?string,
  +$fragmentType: RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$key = {
  +$data?: RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest1MarkdownUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "markdown",
      "storageKey": null
    },
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
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "0664dafd5e47ea16f70ed265f10ae379";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$fragmentType,
  RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$data,
>*/);
