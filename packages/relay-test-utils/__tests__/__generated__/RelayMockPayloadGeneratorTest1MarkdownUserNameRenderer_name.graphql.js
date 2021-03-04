/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8ca9a310b5224b1c087d39cf93c54891>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$fragmentType: RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$ref;
export type RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$refType: RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$ref,
|};
export type RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$data = RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name;
export type RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$key = {
  +$data?: RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$ref,
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

module.exports = node;
