/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<49b299286909af89a93a27dbd75670a6>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$data = {
  readonly __typename: "MarkdownUserNameRenderer",
  readonly data: ?{
    readonly markup: ?string,
  },
  readonly markdown: ?string,
  readonly $fragmentType: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$fragmentType,
};
export type RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$fragmentType,
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
  (node/*:: as any*/).hash = "38a5ed669dc5cdaba4d42f736fd1beac";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteWithOverlappingModuleTestMarkdownActorNameRenderer_name$data,
>*/);
