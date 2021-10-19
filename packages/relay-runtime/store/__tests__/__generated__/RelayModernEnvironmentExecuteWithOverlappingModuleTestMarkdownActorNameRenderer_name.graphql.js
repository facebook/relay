/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a5165cc9a01481b6b63631aeb949d565>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$fragmentType: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$ref;
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +__typename: "MarkdownUserNameRenderer",
  +$refType: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$ref,
|};
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$data = RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name;
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$ref,
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

module.exports = node;
