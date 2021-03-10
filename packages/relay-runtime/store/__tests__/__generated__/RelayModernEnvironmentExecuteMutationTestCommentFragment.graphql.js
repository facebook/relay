/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9e96366fb6227e34e9966f19e3c64aa3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteMutationTestCommentFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteMutationTestCommentFragment$fragmentType: RelayModernEnvironmentExecuteMutationTestCommentFragment$ref;
export type RelayModernEnvironmentExecuteMutationTestCommentFragment = {|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$refType: RelayModernEnvironmentExecuteMutationTestCommentFragment$ref,
|};
export type RelayModernEnvironmentExecuteMutationTestCommentFragment$data = RelayModernEnvironmentExecuteMutationTestCommentFragment;
export type RelayModernEnvironmentExecuteMutationTestCommentFragment$key = {
  +$data?: RelayModernEnvironmentExecuteMutationTestCommentFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteMutationTestCommentFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteMutationTestCommentFragment",
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
  (node/*: any*/).hash = "a2cd576906a3042c94571afb29a4f2f5";
}

module.exports = node;
