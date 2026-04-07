/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e420377ec41db1e7d8d66a1e3b9287cf>>
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
  (node/*:: as any*/).hash = "0a62ca17583bf06a225f706e103dc11e";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  observeFragmentTestMissingRequiredPluralFragment$fragmentType,
  observeFragmentTestMissingRequiredPluralFragment$data,
>*/);
