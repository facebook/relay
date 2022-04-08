/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d3fc41e43515dd457b3d3cdf053a77c2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { UpdatableFragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type readUpdatableFragmentEXPERIMENTALTest_user$fragmentType: FragmentType;
export type readUpdatableFragmentEXPERIMENTALTest_user$data = {|
  firstName: ?string,
  firstName2: ?string,
  +$fragmentType: readUpdatableFragmentEXPERIMENTALTest_user$fragmentType,
|};
export type readUpdatableFragmentEXPERIMENTALTest_user$key = {
  +$data?: readUpdatableFragmentEXPERIMENTALTest_user$data,
  +$updatableFragmentSpreads: readUpdatableFragmentEXPERIMENTALTest_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "if2"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "readUpdatableFragmentEXPERIMENTALTest_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "firstName",
      "storageKey": null
    },
    {
      "alias": "firstName2",
      "args": [
        {
          "kind": "Variable",
          "name": "if",
          "variableName": "if2"
        }
      ],
      "kind": "ScalarField",
      "name": "firstName",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "5de9847cd4133fe73dc2812f7cfe7e12";
}

module.exports = ((node/*: any*/)/*: UpdatableFragment<
  readUpdatableFragmentEXPERIMENTALTest_user$fragmentType,
  readUpdatableFragmentEXPERIMENTALTest_user$data,
>*/);
