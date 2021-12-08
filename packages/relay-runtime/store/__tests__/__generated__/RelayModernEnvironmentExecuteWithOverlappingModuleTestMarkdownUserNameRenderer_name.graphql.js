/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f23035482041930abf679df936b05548>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$ref = RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$fragmentType;
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$data = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +__typename: "MarkdownUserNameRenderer",
  +$fragmentType: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name = RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$data;
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "07e76a04931c67382ea21c3b4c149300";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$data,
>*/);
