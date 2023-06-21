/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9b956e78be808809ccfe725ba1b108fc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment.actor.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$fragmentType } from "./RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name.graphql";
import type { RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$fragmentType } from "./RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$data = {|
  +actor: ?{|
    +name: ?string,
    +nameRenderer: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$fragmentType & RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$fragmentType,
    |},
  |},
  +id: string,
  +$fragmentType: RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$key = {
  +$data?: RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": null,
          "args": [
            {
              "kind": "Literal",
              "name": "supported",
              "value": "34hjiS"
            }
          ],
          "concreteType": null,
          "kind": "LinkedField",
          "name": "nameRenderer",
          "plural": false,
          "selections": [
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": null,
                  "documentName": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment",
                  "fragmentName": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name",
                  "fragmentPropName": "name",
                  "kind": "ModuleImport"
                }
              ],
              "type": "PlainUserNameRenderer",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": null,
                  "documentName": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment",
                  "fragmentName": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name",
                  "fragmentPropName": "name",
                  "kind": "ModuleImport"
                }
              ],
              "type": "MarkdownUserNameRenderer",
              "abstractKey": null
            }
          ],
          "storageKey": "nameRenderer(supported:\"34hjiS\")"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Comment",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "c6eda812d553cb45a1f53cfb2577d5ed";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$fragmentType,
  RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$data,
>*/);
