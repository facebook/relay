/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<cd8ae6dcb80f15d982af9ae4608de23f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$data = {|
  +__typename: "MarkdownUserNameRenderer",
  +data: ?{|
    +markup: ?string,
  |},
  +markdown: ?string,
  +$fragmentType: RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
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
          "alias": "markup",
          "args": null,
          "kind": "ScalarField",
          "name": "__markup_markup_handler",
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
  (node/*: any*/).hash = "205ac2e53fd943ad6269eb2b3c1c6e69";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$data,
>*/);
