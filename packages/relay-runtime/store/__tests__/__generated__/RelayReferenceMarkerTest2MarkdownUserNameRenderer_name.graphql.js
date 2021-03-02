/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6f5c57e111bd5b468a182c2c66636588>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$fragmentType: RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$ref;
export type RelayReferenceMarkerTest2MarkdownUserNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$refType: RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$ref,
|};
export type RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$data = RelayReferenceMarkerTest2MarkdownUserNameRenderer_name;
export type RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$key = {
  +$data?: RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$data,
  +$fragmentRefs: RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReferenceMarkerTest2MarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "b8f4f1fbddfefb0ef83796eceefdd9e2";
}

module.exports = node;
