/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<21e9a2d78f9faae44013301ba3b6f3d7>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { UpdatableFragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type readUpdatableFragmentTest_user$fragmentType: FragmentType;
export type readUpdatableFragmentTest_user$data = {
  firstName: ?string,
  firstName2: ?string,
  readonly $fragmentType: readUpdatableFragmentTest_user$fragmentType,
};
export type readUpdatableFragmentTest_user$key = {
  readonly $data?: readUpdatableFragmentTest_user$data,
  readonly $updatableFragmentSpreads: readUpdatableFragmentTest_user$fragmentType,
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
  "name": "readUpdatableFragmentTest_user",
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
  (node/*:: as any*/).hash = "c812b9d445ff295af2eac12937098ddb";
}

module.exports = ((node/*:: as any*/)/*:: as UpdatableFragment<
  readUpdatableFragmentTest_user$fragmentType,
  readUpdatableFragmentTest_user$data,
>*/);
