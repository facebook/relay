/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a0a7501be8f413a2938b11e182ad3a05>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserGreetingResolver$fragmentType: FragmentType;
export type UserGreetingResolver$data = {|
  +name: ?string,
  +$fragmentType: UserGreetingResolver$fragmentType,
|};
export type UserGreetingResolver$key = {
  +$data?: UserGreetingResolver$data,
  +$fragmentSpreads: UserGreetingResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserGreetingResolver",
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
  (node/*:: as any*/).hash = "db35ed2748ee5f78dd5856210d98488e";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  UserGreetingResolver$fragmentType,
  UserGreetingResolver$data,
>*/);
