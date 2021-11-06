/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<788e16173680dfa0df0d65b33d363b40>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$fragmentType: RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$ref;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +__typename: "MarkdownUserNameRenderer",
  +$refType: RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$ref,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$data = RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$ref,
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

module.exports = node;
