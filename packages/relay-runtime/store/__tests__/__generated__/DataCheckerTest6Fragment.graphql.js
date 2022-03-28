/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<150d389d2f1b5f295b4eaba512b5f1fd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest6Fragment$fragmentType: FragmentType;
export type DataCheckerTest6Fragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: DataCheckerTest6Fragment$fragmentType,
|};
export type DataCheckerTest6Fragment$key = {
  +$data?: DataCheckerTest6Fragment$data,
  +$fragmentSpreads: DataCheckerTest6Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest6Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
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
  (node/*: any*/).hash = "a0b736027f00dc43e7485caf5a756903";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest6Fragment$fragmentType,
  DataCheckerTest6Fragment$data,
>*/);
