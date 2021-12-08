/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b64a4114b219d0bb1c7bf0cb8e335937>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$ref = FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType;
export type FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$data = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$fragmentType: FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType,
|};
export type FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name = FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$data;
export type FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$key = {
  +$data?: FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType,
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
  (node/*: any*/).hash = "b24e267fc49e1c18ab519d695f719894";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType,
  FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$data,
>*/);
