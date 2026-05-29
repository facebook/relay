/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<065681fd81ddedcac18b9ebbdc5039f3>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$data = {
  readonly data: ?{
    readonly markup: ?string,
  },
  readonly markdown: ?string,
  readonly $fragmentType: FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType,
};
export type FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$key = {
  readonly $data?: FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$data,
  readonly $fragmentSpreads: FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name",
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
  (node/*:: as any*/).hash = "b24e267fc49e1c18ab519d695f719894";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType,
  FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$data,
>*/);
