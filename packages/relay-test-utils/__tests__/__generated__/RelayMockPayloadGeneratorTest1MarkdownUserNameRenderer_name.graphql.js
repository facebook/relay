/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<855eaeaef54a1b06dcc9104dd75ff185>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$ref = RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$fragmentType;
export type RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$data = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name = RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$data;
export type RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$key = {
  +$data?: RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "2054b4305b85ec22227225d7bbb81827";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$fragmentType,
  RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$data,
>*/);
