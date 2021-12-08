/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7fa23e061b7bd78131186445fffcaf0e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$ref = RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$fragmentType;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$data = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +__typename: "MarkdownUserNameRenderer",
  +$fragmentType: RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name = RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$data;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "91aacf5acd483072e41b61d28ba830b4";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$data,
>*/);
