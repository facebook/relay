/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fb80c64a05815865f4a7a0b6c0861a4c>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentWithDeferAndLiveUpdateTestFragment$fragmentType: FragmentType;
export type useFragmentWithDeferAndLiveUpdateTestFragment$data = {
  readonly name: ?string,
  readonly $fragmentType: useFragmentWithDeferAndLiveUpdateTestFragment$fragmentType,
};
export type useFragmentWithDeferAndLiveUpdateTestFragment$key = {
  readonly $data?: useFragmentWithDeferAndLiveUpdateTestFragment$data,
  readonly $fragmentSpreads: useFragmentWithDeferAndLiveUpdateTestFragment$fragmentType,
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
  (node/*:: as any*/).hash = "e94b5cf91e27dc387e221c16d5081f9a";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useFragmentWithDeferAndLiveUpdateTestFragment$fragmentType,
  useFragmentWithDeferAndLiveUpdateTestFragment$data,
>*/);
