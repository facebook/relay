/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3f564730ba5a30b5af5799182f1293b3>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeFragmentTestMissingRequiredFragment$fragmentType: FragmentType;
export type observeFragmentTestMissingRequiredFragment$data = {
  readonly name: string,
  readonly $fragmentType: observeFragmentTestMissingRequiredFragment$fragmentType,
};
export type observeFragmentTestMissingRequiredFragment$key = {
  readonly $data?: observeFragmentTestMissingRequiredFragment$data,
  readonly $fragmentSpreads: observeFragmentTestMissingRequiredFragment$fragmentType,
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
      "action": "THROW"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "84a962af73a48eb7319d5875e7dabb3b";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  observeFragmentTestMissingRequiredFragment$fragmentType,
  observeFragmentTestMissingRequiredFragment$data,
>*/);
