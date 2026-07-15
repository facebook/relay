/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<328a78aec9737e8b3aa4c6c6501fcb09>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserGreetingResolver$fragmentType: FragmentType;
export type UserGreetingResolver$data = {
  readonly name: ?string,
  readonly $fragmentType: UserGreetingResolver$fragmentType,
};
export type UserGreetingResolver$key = {
  readonly $data?: UserGreetingResolver$data,
  readonly $fragmentSpreads: UserGreetingResolver$fragmentType,
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
