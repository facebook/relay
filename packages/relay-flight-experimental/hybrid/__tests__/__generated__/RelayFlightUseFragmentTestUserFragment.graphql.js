/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<df0219ad21ba5d2b0f1a4847cc482e45>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayFlightUseFragmentTestUserFragment$fragmentType: FragmentType;
export type RelayFlightUseFragmentTestUserFragment$data = {|
  +name: ?string,
  +$fragmentType: RelayFlightUseFragmentTestUserFragment$fragmentType,
|};
export type RelayFlightUseFragmentTestUserFragment$key = {
  +$data?: RelayFlightUseFragmentTestUserFragment$data,
  +$fragmentSpreads: RelayFlightUseFragmentTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayFlightUseFragmentTestUserFragment",
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
  (node/*: any*/).hash = "19b3122103851e7411ed9ab586799c09";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayFlightUseFragmentTestUserFragment$fragmentType,
  RelayFlightUseFragmentTestUserFragment$data,
>*/);
