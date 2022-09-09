/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6839109517c7af8422f6cc92d4bf331e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$data = {|
  +data: ?{|
    +markup: ?string,
  |},
  +markdown: ?string,
  +$fragmentType: RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$key = {
  +$data?: RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$fragmentType,
  RelayReferenceMarkerTest2MarkdownUserNameRenderer_name$data,
>*/);
