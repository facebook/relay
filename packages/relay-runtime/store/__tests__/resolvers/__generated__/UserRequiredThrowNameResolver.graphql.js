/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c3461c03a800b18daf6b107d739085fa>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserRequiredThrowNameResolver$fragmentType: FragmentType;
export type UserRequiredThrowNameResolver$data = {|
  +name: string,
  +$fragmentType: UserRequiredThrowNameResolver$fragmentType,
|};
export type UserRequiredThrowNameResolver$key = {
  +$data?: UserRequiredThrowNameResolver$data,
  +$fragmentSpreads: UserRequiredThrowNameResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserRequiredThrowNameResolver",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      "action": "THROW"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "add4c07fa95ec86cafaa371aba650cc8";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserRequiredThrowNameResolver$fragmentType,
  UserRequiredThrowNameResolver$data,
>*/);
