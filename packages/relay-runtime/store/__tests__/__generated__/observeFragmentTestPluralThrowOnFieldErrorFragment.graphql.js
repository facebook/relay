/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9ce7d82be81c9637641e26d193cc0e21>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeFragmentTestPluralThrowOnFieldErrorFragment$fragmentType: FragmentType;
export type observeFragmentTestPluralThrowOnFieldErrorFragment$data = $ReadOnlyArray<{|
  +name: string | null,
  +$fragmentType: observeFragmentTestPluralThrowOnFieldErrorFragment$fragmentType,
|}>;
export type observeFragmentTestPluralThrowOnFieldErrorFragment$key = $ReadOnlyArray<{
  +$data?: observeFragmentTestPluralThrowOnFieldErrorFragment$data,
  +$fragmentSpreads: observeFragmentTestPluralThrowOnFieldErrorFragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true,
    "throwOnFieldError": true
  },
  "name": "observeFragmentTestPluralThrowOnFieldErrorFragment",
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
  (node/*: any*/).hash = "531291e1335ff8e4ffacf60c7a6064ed";
}

module.exports = ((node/*: any*/)/*: Fragment<
  observeFragmentTestPluralThrowOnFieldErrorFragment$fragmentType,
  observeFragmentTestPluralThrowOnFieldErrorFragment$data,
>*/);
