/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<993a75c6a2d28b8c6e61368bf6786ac3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$data = {|
  +data: ?{|
    +markup: ?string,
  |},
  +markdown: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$key = {
  +$data?: RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "320b2251dd591df91790a634f8ce3bf2";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$fragmentType,
  RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$data,
>*/);
