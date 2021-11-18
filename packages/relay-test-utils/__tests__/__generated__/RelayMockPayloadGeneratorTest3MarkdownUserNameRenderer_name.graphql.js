/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dd6aa36f65748dd2ec188b98dab07be0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$ref = RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$fragmentType;
export type RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$data = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name = RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$data;
export type RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$key = {
  +$data?: RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "4a23ec2021aaa437e8f2d0215a3e93c2";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$fragmentType,
  RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$data,
>*/);
