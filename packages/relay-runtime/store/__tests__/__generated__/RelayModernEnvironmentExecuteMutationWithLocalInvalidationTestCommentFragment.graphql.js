/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e59e122b7dcb0695d0b327ff2ff2f7b5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$fragmentType: RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$ref;
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment = {|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$refType: RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$ref,
|};
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$data = RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment;
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$key = {
  +$data?: RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment",
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
  (node/*: any*/).hash = "bc14e8d2677d8a33ad9d1cfa5411894d";
}

module.exports = node;
