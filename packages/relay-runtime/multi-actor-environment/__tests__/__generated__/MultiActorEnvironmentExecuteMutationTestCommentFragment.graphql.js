/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e3d41b8ade87349992b107c68f124901>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type MultiActorEnvironmentExecuteMutationTestCommentFragment$ref: FragmentReference;
declare export opaque type MultiActorEnvironmentExecuteMutationTestCommentFragment$fragmentType: MultiActorEnvironmentExecuteMutationTestCommentFragment$ref;
export type MultiActorEnvironmentExecuteMutationTestCommentFragment = {|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$refType: MultiActorEnvironmentExecuteMutationTestCommentFragment$ref,
|};
export type MultiActorEnvironmentExecuteMutationTestCommentFragment$data = MultiActorEnvironmentExecuteMutationTestCommentFragment;
export type MultiActorEnvironmentExecuteMutationTestCommentFragment$key = {
  +$data?: MultiActorEnvironmentExecuteMutationTestCommentFragment$data,
  +$fragmentRefs: MultiActorEnvironmentExecuteMutationTestCommentFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "MultiActorEnvironmentExecuteMutationTestCommentFragment",
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
  (node/*: any*/).hash = "b667e27502401d6fcf6ca2ce2d7f7f14";
}

module.exports = node;
