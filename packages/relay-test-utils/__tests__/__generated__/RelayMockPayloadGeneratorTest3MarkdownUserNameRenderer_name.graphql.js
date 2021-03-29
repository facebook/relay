/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<14268e517547907cc5551e4144a8b4b3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$fragmentType: RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$ref;
export type RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$refType: RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$ref,
|};
export type RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$data = RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name;
export type RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$key = {
  +$data?: RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name$ref,
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

module.exports = node;
