/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6ab99368fc8958e5a046a3c6639511d8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$ref = RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$fragmentType;
export type RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$data = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name = RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$data;
export type RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$key = {
  +$data?: RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "aa7df0a70673a0d1692321d1444ca28a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$fragmentType,
  RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$data,
>*/);
