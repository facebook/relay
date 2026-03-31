/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9df9ab6a641c56b9a3710f7a33a4a35a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type requestSubscriptionTestExtraFragment$fragmentType: FragmentType;
export type requestSubscriptionTestExtraFragment$data = {|
  +isEnabled: ?boolean,
  +$fragmentType: requestSubscriptionTestExtraFragment$fragmentType,
|};
export type requestSubscriptionTestExtraFragment$key = {
  +$data?: requestSubscriptionTestExtraFragment$data,
  +$fragmentSpreads: requestSubscriptionTestExtraFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "requestSubscriptionTestExtraFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isEnabled",
      "storageKey": null
    }
  ],
  "type": "Config",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "93722b56e12ad71765eb789731338c25";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  requestSubscriptionTestExtraFragment$fragmentType,
  requestSubscriptionTestExtraFragment$data,
>*/);
