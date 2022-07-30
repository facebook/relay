/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a04dcf0edc0fdaa3286cd6b9e0fe3cdf>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type validateMutationTestEntityFragement$fragmentType: FragmentType;
export type validateMutationTestEntityFragement$data = {|
  +url: ?string,
  +$fragmentType: validateMutationTestEntityFragement$fragmentType,
|};
export type validateMutationTestEntityFragement$key = {
  +$data?: validateMutationTestEntityFragement$data,
  +$fragmentSpreads: validateMutationTestEntityFragement$fragmentType,
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
  (node/*: any*/).hash = "1e2cf14929257c565b3de24df6f6c4af";
}

module.exports = ((node/*: any*/)/*: Fragment<
  validateMutationTestEntityFragement$fragmentType,
  validateMutationTestEntityFragement$data,
>*/);
