/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<90868c0f46513e1a5d0a1e304309f8b1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name$data = {|
  +__typename: "MarkdownUserNameRenderer",
  +data: ?{|
    +markup: ?string,
  |},
  +markdown: ?string,
  +$fragmentType: RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "d9495c5de499cc86fa469c5c966f1883";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteWithMatchAdditionalArgumentsTestMarkdownUserNameRenderer_name$data,
>*/);
