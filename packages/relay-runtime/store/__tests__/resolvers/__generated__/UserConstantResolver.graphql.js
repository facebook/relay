/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<050569fd32fba010b9a515ecfba16499>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserConstantResolver$fragmentType: FragmentType;
export type UserConstantResolver$data = {|
  +name: ?string,
  +$fragmentType: UserConstantResolver$fragmentType,
|};
export type UserConstantResolver$key = {
  +$data?: UserConstantResolver$data,
  +$fragmentSpreads: UserConstantResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserConstantResolver",
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
  (node/*: any*/).hash = "d81f06bd9926d137c37e8cc6a220f8af";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserConstantResolver$fragmentType,
  UserConstantResolver$data,
>*/);
