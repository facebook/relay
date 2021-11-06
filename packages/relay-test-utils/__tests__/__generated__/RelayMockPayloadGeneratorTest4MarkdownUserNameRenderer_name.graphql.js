/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<457470bedb535f77d2fd0d8568c9e449>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$fragmentType: RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$ref;
export type RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$refType: RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$ref,
|};
export type RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$data = RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name;
export type RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$key = {
  +$data?: RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name$ref,
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

module.exports = node;
