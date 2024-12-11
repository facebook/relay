/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dda30aab49d809d126154385fbf1746c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeFragmentTestListUpdateFragment$fragmentType: FragmentType;
export type observeFragmentTestListUpdateFragment$data = $ReadOnlyArray<{|
  +name: ?string,
  +$fragmentType: observeFragmentTestListUpdateFragment$fragmentType,
|}>;
export type observeFragmentTestListUpdateFragment$key = $ReadOnlyArray<{
  +$data?: observeFragmentTestListUpdateFragment$data,
  +$fragmentSpreads: observeFragmentTestListUpdateFragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "observeFragmentTestListUpdateFragment",
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
  (node/*: any*/).hash = "30d272ba4e5c5a9eb1d9a79015a69ec3";
}

module.exports = ((node/*: any*/)/*: Fragment<
  observeFragmentTestListUpdateFragment$fragmentType,
  observeFragmentTestListUpdateFragment$data,
>*/);
