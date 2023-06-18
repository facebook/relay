/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<083f92486922d44a032953c254d97931>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { UpdatableFragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type readUpdatableFragmentTest_2_user$fragmentType: FragmentType;
export type readUpdatableFragmentTest_2_user$data = {|
  firstName2: ?string,
  firstName3: ?string,
  +$fragmentType: readUpdatableFragmentTest_2_user$fragmentType,
|};
export type readUpdatableFragmentTest_2_user$key = {
  +$data?: readUpdatableFragmentTest_2_user$data,
  +$updatableFragmentSpreads: readUpdatableFragmentTest_2_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "if2"
    },
    {
      "kind": "RootArgument",
      "name": "if3"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "readUpdatableFragmentTest_2_user",
  "selections": [
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
    },
    {
      "alias": "firstName3",
      "args": [
        {
          "kind": "Variable",
          "name": "if",
          "variableName": "if3"
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
  (node/*: any*/).hash = "0fb331ffbeb5a3f53bcffc8c1f8edde4";
}

module.exports = ((node/*: any*/)/*: UpdatableFragment<
  readUpdatableFragmentTest_2_user$fragmentType,
  readUpdatableFragmentTest_2_user$data,
>*/);
