/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fd526e3226d6cf0c74918e34eedd4caa>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment.actor.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$fragmentType = any;
type RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$ref = RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$fragmentType;
export type RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$data = {|
  +id: string,
  +actor: ?{|
    +name: ?string,
    +nameRenderer: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$fragmentType & RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$fragmentType,
    |},
  |},
  +$fragmentType: RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment = RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$data;
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
  (node/*: any*/).hash = "f1ff7fec552839f61ccff1a73226c40e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$fragmentType,
  RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$data,
>*/);
