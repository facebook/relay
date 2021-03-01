/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<901cd82bb38167eac26939aefe471b47>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTestMarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTestMarkdownUserNameRenderer_name$fragmentType: RelayResponseNormalizerTestMarkdownUserNameRenderer_name$ref;
export type RelayResponseNormalizerTestMarkdownUserNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$refType: RelayResponseNormalizerTestMarkdownUserNameRenderer_name$ref,
|};
export type RelayResponseNormalizerTestMarkdownUserNameRenderer_name$data = RelayResponseNormalizerTestMarkdownUserNameRenderer_name;
export type RelayResponseNormalizerTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayResponseNormalizerTestMarkdownUserNameRenderer_name$data,
  +$fragmentRefs: RelayResponseNormalizerTestMarkdownUserNameRenderer_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTestMarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "5fe7113966108858b3c342953f47b4d0";
}

module.exports = node;
