/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b43b6c8fc2b6ea0f001398d2e0551702>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType: FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$ref;
export type FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$refType: FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$ref,
|};
export type FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$data = FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name;
export type FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$key = {
  +$data?: FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$data,
  +$fragmentRefs: FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name$ref,
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

module.exports = node;
