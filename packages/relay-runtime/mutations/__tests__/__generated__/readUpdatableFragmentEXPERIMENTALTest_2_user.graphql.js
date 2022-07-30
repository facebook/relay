/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3385e5f6259c59905cfef87ced40bdd3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { UpdatableFragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type readUpdatableFragmentEXPERIMENTALTest_2_user$fragmentType: FragmentType;
export type readUpdatableFragmentEXPERIMENTALTest_2_user$data = {|
  firstName2: ?string,
  firstName3: ?string,
  +$fragmentType: readUpdatableFragmentEXPERIMENTALTest_2_user$fragmentType,
|};
export type readUpdatableFragmentEXPERIMENTALTest_2_user$key = {
  +$data?: readUpdatableFragmentEXPERIMENTALTest_2_user$data,
  +$updatableFragmentSpreads: readUpdatableFragmentEXPERIMENTALTest_2_user$fragmentType,
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
  "name": "readUpdatableFragmentEXPERIMENTALTest_2_user",
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
  (node/*: any*/).hash = "4fd166e46d12478b5c5d8c4ffb70503f";
}

module.exports = ((node/*: any*/)/*: UpdatableFragment<
  readUpdatableFragmentEXPERIMENTALTest_2_user$fragmentType,
  readUpdatableFragmentEXPERIMENTALTest_2_user$data,
>*/);
