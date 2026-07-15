/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<260b9310bbd2ff6ab082bcff0f108b2a>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type validateMutationTestEntityFragement$fragmentType: FragmentType;
export type validateMutationTestEntityFragement$data = {
  readonly url: ?string,
  readonly $fragmentType: validateMutationTestEntityFragement$fragmentType,
};
export type validateMutationTestEntityFragement$key = {
  readonly $data?: validateMutationTestEntityFragement$data,
  readonly $fragmentSpreads: validateMutationTestEntityFragement$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "validateMutationTestEntityFragement",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "url",
      "storageKey": null
    }
  ],
  "type": "Entity",
  "abstractKey": "__isEntity"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "1e2cf14929257c565b3de24df6f6c4af";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  validateMutationTestEntityFragement$fragmentType,
  validateMutationTestEntityFragement$data,
>*/);
