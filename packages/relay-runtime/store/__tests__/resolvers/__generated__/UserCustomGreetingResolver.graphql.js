/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2b440b6268d107da0b254ae89016aa07>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
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
  (node/*: any*/).hash = "82650ba6ce92ec56ab1a3f0321788529";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserCustomGreetingResolver$fragmentType,
  UserCustomGreetingResolver$data,
>*/);
