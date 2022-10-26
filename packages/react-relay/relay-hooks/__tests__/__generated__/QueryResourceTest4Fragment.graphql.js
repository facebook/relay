/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<74c9f26fc477d7827a43d5ea3b7c15db>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type QueryResourceTest4Fragment$fragmentType: FragmentType;
export type QueryResourceTest4Fragment$data = {|
  +id: string,
  +$fragmentType: QueryResourceTest4Fragment$fragmentType,
|};
export type QueryResourceTest4Fragment$key = {
  +$data?: QueryResourceTest4Fragment$data,
  +$fragmentSpreads: QueryResourceTest4Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QueryResourceTest4Fragment",
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
  (node/*: any*/).hash = "ccf6ec5f4f4ab422e8bac9b21bd36e96";
}

module.exports = ((node/*: any*/)/*: Fragment<
  QueryResourceTest4Fragment$fragmentType,
  QueryResourceTest4Fragment$data,
>*/);
