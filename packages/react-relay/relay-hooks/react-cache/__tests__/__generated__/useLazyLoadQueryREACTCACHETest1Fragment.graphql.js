/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1723d9f143bb98bfff3918381c689702>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useLazyLoadQueryREACTCACHETest1Fragment$fragmentType: FragmentType;
export type useLazyLoadQueryREACTCACHETest1Fragment$data = {|
  +name: ?string,
  +$fragmentType: useLazyLoadQueryREACTCACHETest1Fragment$fragmentType,
|};
export type useLazyLoadQueryREACTCACHETest1Fragment$key = {
  +$data?: useLazyLoadQueryREACTCACHETest1Fragment$data,
  +$fragmentSpreads: useLazyLoadQueryREACTCACHETest1Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useLazyLoadQueryREACTCACHETest1Fragment",
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
  (node/*: any*/).hash = "cbe8a3b8ca4ae6ac275a86584cb5d227";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useLazyLoadQueryREACTCACHETest1Fragment$fragmentType,
  useLazyLoadQueryREACTCACHETest1Fragment$data,
>*/);
