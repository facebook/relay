/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<20d6db6bcd5b6245b39f06ea546532a3>>
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
  (node/*:: as any*/).hash = "1e2cf14929257c565b3de24df6f6c4af";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  validateMutationTestEntityFragement$fragmentType,
  validateMutationTestEntityFragement$data,
>*/);
