/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<661e2158d0bc2c86e77575d121570e0f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeFragmentTestMissingRequiredPluralFragment$fragmentType: FragmentType;
export type observeFragmentTestMissingRequiredPluralFragment$data = ReadonlyArray<{|
  +name: string,
  +$fragmentType: observeFragmentTestMissingRequiredPluralFragment$fragmentType,
|}>;
export type observeFragmentTestMissingRequiredPluralFragment$key = ReadonlyArray<{
  +$data?: observeFragmentTestMissingRequiredPluralFragment$data,
  +$fragmentSpreads: observeFragmentTestMissingRequiredPluralFragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "observeFragmentTestMissingRequiredPluralFragment",
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
      "action": "THROW"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "0a62ca17583bf06a225f706e103dc11e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  observeFragmentTestMissingRequiredPluralFragment$fragmentType,
  observeFragmentTestMissingRequiredPluralFragment$data,
>*/);
