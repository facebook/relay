/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f42d9498fe3bf1d3222392fbc372eccc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTestMarkdownUserNameRenderer_nameFragment$fragmentType: FragmentType;
export type DataCheckerTestMarkdownUserNameRenderer_nameFragment$data = {|
  +data: ?{|
    +markup: ?string,
  |},
  +markdown: ?string,
  +$fragmentType: DataCheckerTestMarkdownUserNameRenderer_nameFragment$fragmentType,
|};
export type DataCheckerTestMarkdownUserNameRenderer_nameFragment$key = {
  +$data?: DataCheckerTestMarkdownUserNameRenderer_nameFragment$data,
  +$fragmentSpreads: DataCheckerTestMarkdownUserNameRenderer_nameFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTestMarkdownUserNameRenderer_nameFragment",
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
  (node/*: any*/).hash = "820d8b5dec3d3a5e954443aaa7c73b0d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTestMarkdownUserNameRenderer_nameFragment$fragmentType,
  DataCheckerTestMarkdownUserNameRenderer_nameFragment$data,
>*/);
