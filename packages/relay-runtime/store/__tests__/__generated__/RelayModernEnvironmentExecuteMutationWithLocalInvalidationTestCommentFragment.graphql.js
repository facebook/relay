/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<95de2197b21c1fe12780db93f1a8e2f5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$ref = RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$fragmentType;
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$data = {|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment = RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$data;
export type RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$key = {
  +$data?: RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$fragmentType,
  RelayModernEnvironmentExecuteMutationWithLocalInvalidationTestCommentFragment$data,
>*/);
