/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<35e6872ec304937560d2dd6d2a9e6fc9>>
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
  (node/*: any*/).hash = "93722b56e12ad71765eb789731338c25";
}

module.exports = ((node/*: any*/)/*: Fragment<
  requestSubscriptionTestExtraFragment$fragmentType,
  requestSubscriptionTestExtraFragment$data,
>*/);
