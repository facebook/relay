/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<584f340d3ecb9ef7d86d65060f935202>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$ref = RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$fragmentType;
export type RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$data = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +__typename: "MarkdownUserNameRenderer",
  +$fragmentType: RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name = RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$data;
export type RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "3df8aa0cf41321b16c36d15f6fce34d1";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$data,
>*/);
