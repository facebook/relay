/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<68d4e73a81d8da89bc408d7df4b0ac49>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type QueryResourceTest3Fragment$fragmentType: FragmentType;
export type QueryResourceTest3Fragment$data = {|
  +id: string,
  +$fragmentType: QueryResourceTest3Fragment$fragmentType,
|};
export type QueryResourceTest3Fragment$key = {
  +$data?: QueryResourceTest3Fragment$data,
  +$fragmentSpreads: QueryResourceTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QueryResourceTest3Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "6a44f17afe34540ffe0084ee7abe4cbf";
}

module.exports = ((node/*: any*/)/*: Fragment<
  QueryResourceTest3Fragment$fragmentType,
  QueryResourceTest3Fragment$data,
>*/);
