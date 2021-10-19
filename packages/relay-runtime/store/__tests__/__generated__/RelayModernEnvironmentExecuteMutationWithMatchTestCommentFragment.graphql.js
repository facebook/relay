/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c5416d95e6b62fcb971a850762d2ed20>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment.actor.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$ref = any;
type RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$fragmentType: RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$ref;
export type RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment = {|
  +id: string,
  +actor: ?{|
    +name: ?string,
    +nameRenderer: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentRefs: RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$ref & RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$ref,
    |},
  |},
  +$refType: RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$ref,
|};
export type RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$data = RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment;
export type RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$key = {
  +$data?: RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment$ref,
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

module.exports = node;
