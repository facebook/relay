/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e4480e7e7bc863849d7fbc523d7b2e9d>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayReferenceMarkerTestMarkdownUserNameRenderer_name$data = {
  readonly data: ?{
    readonly markup: ?string,
  },
  readonly markdown: ?string,
  readonly $fragmentType: RelayReferenceMarkerTestMarkdownUserNameRenderer_name$fragmentType,
};
export type RelayReferenceMarkerTestMarkdownUserNameRenderer_name$key = {
  readonly $data?: RelayReferenceMarkerTestMarkdownUserNameRenderer_name$data,
  readonly $fragmentSpreads: RelayReferenceMarkerTestMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReferenceMarkerTestMarkdownUserNameRenderer_name",
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
  (node/*:: as any*/).hash = "3435d059eae2fc726bf5cddeb6431b82";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReferenceMarkerTestMarkdownUserNameRenderer_name$fragmentType,
  RelayReferenceMarkerTestMarkdownUserNameRenderer_name$data,
>*/);
