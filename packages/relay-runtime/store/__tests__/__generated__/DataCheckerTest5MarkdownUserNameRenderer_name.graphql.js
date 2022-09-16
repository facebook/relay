/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f0b9b803e0e5a02d8ca543a6726c1145>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest5MarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type DataCheckerTest5MarkdownUserNameRenderer_name$data = {|
  +data: ?{|
    +markup: ?string,
  |},
  +markdown: ?string,
  +$fragmentType: DataCheckerTest5MarkdownUserNameRenderer_name$fragmentType,
|};
export type DataCheckerTest5MarkdownUserNameRenderer_name$key = {
  +$data?: DataCheckerTest5MarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: DataCheckerTest5MarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest5MarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "a4dd0ea908e618332756ce61165bc6c0";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest5MarkdownUserNameRenderer_name$fragmentType,
  DataCheckerTest5MarkdownUserNameRenderer_name$data,
>*/);
