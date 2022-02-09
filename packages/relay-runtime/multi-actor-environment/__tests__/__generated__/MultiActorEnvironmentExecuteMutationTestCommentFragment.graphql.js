/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bee588a6b74c6760d600631116c6e551>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type MultiActorEnvironmentExecuteMutationTestCommentFragment$fragmentType: FragmentType;
export type MultiActorEnvironmentExecuteMutationTestCommentFragment$data = {|
  +id: string,
  +body: ?{|
    +text: ?string,
  |},
  +$fragmentType: MultiActorEnvironmentExecuteMutationTestCommentFragment$fragmentType,
|};
export type MultiActorEnvironmentExecuteMutationTestCommentFragment$key = {
  +$data?: MultiActorEnvironmentExecuteMutationTestCommentFragment$data,
  +$fragmentSpreads: MultiActorEnvironmentExecuteMutationTestCommentFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  MultiActorEnvironmentExecuteMutationTestCommentFragment$fragmentType,
  MultiActorEnvironmentExecuteMutationTestCommentFragment$data,
>*/);
