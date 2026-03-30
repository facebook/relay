/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<adc848c7509d651b4324651b61b45470>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserLastNameThrowOnFieldErrorResolver$fragmentType: FragmentType;
export type UserLastNameThrowOnFieldErrorResolver$data = {|
  +lastName: ?string,
  +$fragmentType: UserLastNameThrowOnFieldErrorResolver$fragmentType,
|};
export type UserLastNameThrowOnFieldErrorResolver$key = {
  +$data?: UserLastNameThrowOnFieldErrorResolver$data,
  +$fragmentSpreads: UserLastNameThrowOnFieldErrorResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "throwOnFieldError": true
  },
  "name": "UserLastNameThrowOnFieldErrorResolver",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lastName",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "ff9d9439166e75cf4e7c15a502d2d5a9";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  UserLastNameThrowOnFieldErrorResolver$fragmentType,
  UserLastNameThrowOnFieldErrorResolver$data,
>*/);
