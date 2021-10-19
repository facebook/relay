/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3060148d7d776dad6d9452d1f8e9bcae>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$fragmentType: RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$ref;
export type RelayResponseNormalizerTest1MarkdownUserNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$refType: RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$ref,
|};
export type RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$data = RelayResponseNormalizerTest1MarkdownUserNameRenderer_name;
export type RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$key = {
  +$data?: RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$data,
  +$fragmentRefs: RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$ref,
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

module.exports = node;
