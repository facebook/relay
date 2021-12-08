/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9c402cef29811f0fca21308597ded057>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$ref = RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$fragmentType;
export type RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$data = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +__typename: "MarkdownUserNameRenderer",
  +$fragmentType: RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name = RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$data;
export type RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "80ec7dd6e25816e247e4441131f95030";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$data,
>*/);
