/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<86fa4d53a8a7afcd92f645aac9f72878>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserRequiredNameResolver$fragmentType: FragmentType;
export type UserRequiredNameResolver$data = ?{|
  +name: string,
  +$fragmentType: UserRequiredNameResolver$fragmentType,
|};
export type UserRequiredNameResolver$key = {
  +$data?: UserRequiredNameResolver$data,
  +$fragmentSpreads: UserRequiredNameResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserRequiredNameResolver",
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
      "action": "LOG"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "f90844655f3df193e26dae49878ed7a7";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserRequiredNameResolver$fragmentType,
  UserRequiredNameResolver$data,
>*/);
