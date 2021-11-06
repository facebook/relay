/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e282f1482d66846cbcec1cbc1b8f10de>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$fragmentType: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$ref;
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +__typename: "MarkdownUserNameRenderer",
  +$refType: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$ref,
|};
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$data = RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name;
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownUserNameRenderer_name$ref,
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

module.exports = node;
