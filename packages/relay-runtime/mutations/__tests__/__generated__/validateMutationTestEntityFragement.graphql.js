/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b3c8a11023bbed393162d50ec256bef7>>
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
export type validateMutationTestEntityFragement$ref = validateMutationTestEntityFragement$fragmentType;
export type validateMutationTestEntityFragement$data = {|
  +url: ?string,
  +$fragmentType: validateMutationTestEntityFragement$fragmentType,
|};
export type validateMutationTestEntityFragement = validateMutationTestEntityFragement$data;
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
