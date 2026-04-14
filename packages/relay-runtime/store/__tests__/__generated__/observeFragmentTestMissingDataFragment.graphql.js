/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d3f2167e2091ad3226dcfbee15801b4c>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeFragmentTestMissingDataFragment$fragmentType: FragmentType;
export type observeFragmentTestMissingDataFragment$data = {|
  +me: ?{|
    +name: ?string,
  |},
  +$fragmentType: observeFragmentTestMissingDataFragment$fragmentType,
|};
export type observeFragmentTestMissingDataFragment$key = {
  +$data?: observeFragmentTestMissingDataFragment$data,
  +$fragmentSpreads: observeFragmentTestMissingDataFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "observeFragmentTestMissingDataFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "me",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "a21d6eb9daa0c2c86475df325585187d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  observeFragmentTestMissingDataFragment$fragmentType,
  observeFragmentTestMissingDataFragment$data,
>*/);
