/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a009ea20dd6a1e08ff238b7318f7ff5a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type waitForFragmentDataTestMissingDataFragment$fragmentType: FragmentType;
export type waitForFragmentDataTestMissingDataFragment$data = {|
  +me: ?{|
    +name: ?string,
  |},
  +$fragmentType: waitForFragmentDataTestMissingDataFragment$fragmentType,
|};
export type waitForFragmentDataTestMissingDataFragment$key = {
  +$data?: waitForFragmentDataTestMissingDataFragment$data,
  +$fragmentSpreads: waitForFragmentDataTestMissingDataFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "waitForFragmentDataTestMissingDataFragment",
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
  (node/*: any*/).hash = "0992b9b33ecb5789cfce24486852b9ae";
}

module.exports = ((node/*: any*/)/*: Fragment<
  waitForFragmentDataTestMissingDataFragment$fragmentType,
  waitForFragmentDataTestMissingDataFragment$data,
>*/);
