/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ddf1c8feece8ebf4233df23f381182f5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type readUpdatableQueryEXPERIMENTALTest_node$fragmentType: FragmentType;
export type readUpdatableQueryEXPERIMENTALTest_node$ref = readUpdatableQueryEXPERIMENTALTest_node$fragmentType;
export type readUpdatableQueryEXPERIMENTALTest_node$data = {|
  +__typename: string,
  +$fragmentType: readUpdatableQueryEXPERIMENTALTest_node$fragmentType,
|};
export type readUpdatableQueryEXPERIMENTALTest_node = readUpdatableQueryEXPERIMENTALTest_node$data;
export type readUpdatableQueryEXPERIMENTALTest_node$key = {
  +$data?: readUpdatableQueryEXPERIMENTALTest_node$data,
  +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_node$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "readUpdatableQueryEXPERIMENTALTest_node",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

if (__DEV__) {
  (node/*: any*/).hash = "465838c4e7d43969bb152d5e81f2743b";
}

module.exports = ((node/*: any*/)/*: Fragment<
  readUpdatableQueryEXPERIMENTALTest_node$fragmentType,
  readUpdatableQueryEXPERIMENTALTest_node$data,
>*/);
