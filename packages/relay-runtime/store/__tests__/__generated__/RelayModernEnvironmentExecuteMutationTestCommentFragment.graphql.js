/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5823fcf90a849d10b5faf5570e761a03>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteMutationTestCommentFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteMutationTestCommentFragment$ref = RelayModernEnvironmentExecuteMutationTestCommentFragment$fragmentType;
export type RelayModernEnvironmentExecuteMutationTestCommentFragment$data = {|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentExecuteMutationTestCommentFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteMutationTestCommentFragment = RelayModernEnvironmentExecuteMutationTestCommentFragment$data;
export type RelayModernEnvironmentExecuteMutationTestCommentFragment$key = {
  +$data?: RelayModernEnvironmentExecuteMutationTestCommentFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteMutationTestCommentFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteMutationTestCommentFragment$fragmentType,
  RelayModernEnvironmentExecuteMutationTestCommentFragment$data,
>*/);
