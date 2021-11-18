/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<818e81c3bf635f1423e6a82c166877ee>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$ref = RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$fragmentType;
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$data = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +__typename: "MarkdownUserNameRenderer",
  +$fragmentType: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name = RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$data;
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name",
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
  (node/*: any*/).hash = "38a5ed669dc5cdaba4d42f736fd1beac";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$data,
>*/);
