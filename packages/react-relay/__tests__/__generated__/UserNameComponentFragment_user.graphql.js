/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3c61408eb4141517713b08049fac2b27>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserNameComponentFragment_user$fragmentType: FragmentType;
export type UserNameComponentFragment_user$data = {|
  +name: ?string,
  +$fragmentType: UserNameComponentFragment_user$fragmentType,
|};
export type UserNameComponentFragment_user$key = {
  +$data?: UserNameComponentFragment_user$data,
  +$fragmentSpreads: UserNameComponentFragment_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserNameComponentFragment_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "445d4f6b40ae8f7cb3c46226199820e9";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserNameComponentFragment_user$fragmentType,
  UserNameComponentFragment_user$data,
>*/);
