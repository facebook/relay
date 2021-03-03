/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cb1a895217ac16645403b7bf6526be29>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment$fragmentType: RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment$ref;
export type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment = {|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$refType: RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment$ref,
|};
export type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment$data = RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment;
export type RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment$key = {
  +$data?: RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteMutationWithGlobalInvalidationTestCommentFragment",
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
      "concreteType": "Text",
      "kind": "LinkedField",
      "name": "body",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Comment",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "0318fbc96ac921a3d0ac67803adb6399";
}

module.exports = node;
