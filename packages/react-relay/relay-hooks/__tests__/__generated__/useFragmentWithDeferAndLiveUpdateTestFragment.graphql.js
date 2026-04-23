/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentWithDeferAndLiveUpdateTestFragment$fragmentType: FragmentType;
export type useFragmentWithDeferAndLiveUpdateTestFragment$data = {|
  +name: ?string,
  +$fragmentType: useFragmentWithDeferAndLiveUpdateTestFragment$fragmentType,
|};
export type useFragmentWithDeferAndLiveUpdateTestFragment$key = {
  +$data?: useFragmentWithDeferAndLiveUpdateTestFragment$data,
  +$fragmentSpreads: useFragmentWithDeferAndLiveUpdateTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "throwOnFieldError": true
  },
  "name": "useFragmentWithDeferAndLiveUpdateTestFragment",
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
  (node/*:: as any*/).hash = "use_fragment_defer_live_update_fragment_hash";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useFragmentWithDeferAndLiveUpdateTestFragment$fragmentType,
  useFragmentWithDeferAndLiveUpdateTestFragment$data,
>*/);
