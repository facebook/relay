/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7f094363ba2a6a146fb1adf464066237>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeFragmentTestMissingRequiredFragment$fragmentType: FragmentType;
export type observeFragmentTestMissingRequiredFragment$data = {|
  +name: string,
  +$fragmentType: observeFragmentTestMissingRequiredFragment$fragmentType,
|};
export type observeFragmentTestMissingRequiredFragment$key = {
  +$data?: observeFragmentTestMissingRequiredFragment$data,
  +$fragmentSpreads: observeFragmentTestMissingRequiredFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "observeFragmentTestMissingRequiredFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      "action": "THROW",
      "path": "name"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "84a962af73a48eb7319d5875e7dabb3b";
}

module.exports = ((node/*: any*/)/*: Fragment<
  observeFragmentTestMissingRequiredFragment$fragmentType,
  observeFragmentTestMissingRequiredFragment$data,
>*/);
