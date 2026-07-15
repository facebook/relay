/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<58ead8b31bc4bc3d3406f9b0ce4dbe71>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserRequiredNameResolver$fragmentType: FragmentType;
export type UserRequiredNameResolver$data = ?{
  readonly name: string,
  readonly $fragmentType: UserRequiredNameResolver$fragmentType,
};
export type UserRequiredNameResolver$key = {
  readonly $data?: UserRequiredNameResolver$data,
  readonly $fragmentSpreads: UserRequiredNameResolver$fragmentType,
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
  (node/*:: as any*/).hash = "f90844655f3df193e26dae49878ed7a7";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  UserRequiredNameResolver$fragmentType,
  UserRequiredNameResolver$data,
>*/);
