/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<29dbb3ceb09729180d38ff749c1ec036>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type readUpdatableQueryEXPERIMENTALTest_user$fragmentType: FragmentType;
export type readUpdatableQueryEXPERIMENTALTest_user$ref = readUpdatableQueryEXPERIMENTALTest_user$fragmentType;
export type readUpdatableQueryEXPERIMENTALTest_user$data = {|
  +__typename: "User",
  +$fragmentType: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
|} | {|
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  +__typename: "%other",
  +$fragmentType: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
|};
export type readUpdatableQueryEXPERIMENTALTest_user = readUpdatableQueryEXPERIMENTALTest_user$data;
export type readUpdatableQueryEXPERIMENTALTest_user$key = {
  +$data?: readUpdatableQueryEXPERIMENTALTest_user$data,
  +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "readUpdatableQueryEXPERIMENTALTest_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "a4c01703e3cef4e5792340036822efd8";
}

module.exports = ((node/*: any*/)/*: Fragment<
  readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
  readUpdatableQueryEXPERIMENTALTest_user$data,
>*/);
