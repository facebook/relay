/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d3250b2d4a819e4ff5cc686604ea97ca>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeFragmentTestToPromiseFragment$fragmentType: FragmentType;
export type observeFragmentTestToPromiseFragment$data = {|
  +name: ?string,
  +$fragmentType: observeFragmentTestToPromiseFragment$fragmentType,
|};
export type observeFragmentTestToPromiseFragment$key = {
  +$data?: observeFragmentTestToPromiseFragment$data,
  +$fragmentSpreads: observeFragmentTestToPromiseFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "observeFragmentTestToPromiseFragment",
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
  (node/*: any*/).hash = "01caee052d14a0420892e4900903b7c4";
}

module.exports = ((node/*: any*/)/*: Fragment<
  observeFragmentTestToPromiseFragment$fragmentType,
  observeFragmentTestToPromiseFragment$data,
>*/);
