/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c3abe9c4abd807e4f3996036799bf908>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserCustomGreetingResolver$fragmentType: FragmentType;
export type UserCustomGreetingResolver$data = {|
  +name: ?string,
  +$fragmentType: UserCustomGreetingResolver$fragmentType,
|};
export type UserCustomGreetingResolver$key = {
  +$data?: UserCustomGreetingResolver$data,
  +$fragmentSpreads: UserCustomGreetingResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserCustomGreetingResolver",
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
  (node/*:: as any*/).hash = "82650ba6ce92ec56ab1a3f0321788529";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  UserCustomGreetingResolver$fragmentType,
  UserCustomGreetingResolver$data,
>*/);
