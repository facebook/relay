/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f83c23b1cb2348ac531bcc3090977291>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name$data = {|
  +__typename: "MarkdownUserNameRenderer",
  +markdown: ?string,
  +$fragmentType: RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name",
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
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "98b51356569737f7fa582d640033d6b4";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name$data,
>*/);
