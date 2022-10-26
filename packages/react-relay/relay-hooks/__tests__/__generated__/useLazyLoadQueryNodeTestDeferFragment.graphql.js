/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e413c0eb5e62ecd10e35259697c11f8f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useLazyLoadQueryNodeTestDeferFragment$fragmentType: FragmentType;
export type useLazyLoadQueryNodeTestDeferFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: useLazyLoadQueryNodeTestDeferFragment$fragmentType,
|};
export type useLazyLoadQueryNodeTestDeferFragment$key = {
  +$data?: useLazyLoadQueryNodeTestDeferFragment$data,
  +$fragmentSpreads: useLazyLoadQueryNodeTestDeferFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useLazyLoadQueryNodeTestDeferFragment",
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
  (node/*: any*/).hash = "2d48898c3a90b822fb98b540f990f3ad";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useLazyLoadQueryNodeTestDeferFragment$fragmentType,
  useLazyLoadQueryNodeTestDeferFragment$data,
>*/);
