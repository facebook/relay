/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4b21843fdcdb2420e912d49a9fbdf5f8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment.actor.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$fragmentType } from "./RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name.graphql";
import type { RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$fragmentType } from "./RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$data = {|
  +actor: ?{|
    +name: ?string,
    +nameRenderer: ?({|
      +__typename: "MarkdownUserNameRenderer",
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$fragmentType,
    |} | {|
      +__typename: "PlainUserNameRenderer",
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$fragmentType,
    |} | {|
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      +__typename: "%other",
    |}),
  |},
  +id: string,
  +$fragmentType: RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$key = {
  +$data?: RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment",
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
                  "documentName": "RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment",
                  "fragmentName": "RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name",
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
                  "documentName": "RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment",
                  "fragmentName": "RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name",
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
  (node/*:: as any*/).hash = "f1ff7fec552839f61ccff1a73226c40e";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$fragmentType,
  RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$data,
>*/);
