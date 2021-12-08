/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<50b8c3c57b09c5854c495166d9ff5409>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment.actor.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$fragmentType = any;
type RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$ref = RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$fragmentType;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$data = {|
  +id: string,
  +actor: ?{|
    +name: ?string,
    +nameRenderer: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$fragmentType & RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$fragmentType,
    |},
  |},
  +$fragmentType: RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment = RelayModernEnvironmentExecuteSubscriptionWithMatchTestCommentFragment$data;
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
              "value": [
                "PlainUserNameRenderer",
                "MarkdownUserNameRenderer"
              ]
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
          "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
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
