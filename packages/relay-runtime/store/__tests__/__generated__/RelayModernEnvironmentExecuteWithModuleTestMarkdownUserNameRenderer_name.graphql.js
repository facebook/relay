/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a1b22f030d7d37e7e778c5cab6c0df8b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name$data = {
  readonly __typename: "MarkdownUserNameRenderer",
  readonly data: ?{
    readonly markup: ?string,
  },
  readonly markdown: ?string,
  readonly $fragmentType: RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name$fragmentType,
};
export type RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name",
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
  (node/*:: as any*/).hash = "dfe2983812ab88e9900e71fa90f336a7";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteWithModuleTestMarkdownUserNameRenderer_name$data,
>*/);
