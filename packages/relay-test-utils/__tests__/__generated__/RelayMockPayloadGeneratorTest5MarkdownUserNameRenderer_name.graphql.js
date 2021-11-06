/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d809bc2182619436a695627733609410>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$fragmentType: RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$ref;
export type RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$refType: RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$ref,
|};
export type RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$data = RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name;
export type RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$key = {
  +$data?: RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name$ref,
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

module.exports = node;
