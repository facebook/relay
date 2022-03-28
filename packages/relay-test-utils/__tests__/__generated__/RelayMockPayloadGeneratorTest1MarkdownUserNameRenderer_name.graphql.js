/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3ab3c168550e45dfddab89458109a9ab>>
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
export type RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$data = {|
  +data: ?{|
    +markup: ?string,
  |},
  +markdown: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$fragmentType,
|};
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
