/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5c419ae71677a0319faeef65f89fecfc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceTest7Fragment$fragmentType: FragmentType;
export type FragmentResourceTest7Fragment$data = $ReadOnlyArray<{|
  +id: string,
  +$fragmentType: FragmentResourceTest7Fragment$fragmentType,
|}>;
export type FragmentResourceTest7Fragment$key = $ReadOnlyArray<{
  +$data?: FragmentResourceTest7Fragment$data,
  +$fragmentSpreads: FragmentResourceTest7Fragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "FragmentResourceTest7Fragment",
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
  (node/*: any*/).hash = "ebc4afb7252a93a2bd791e8df1d94136";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceTest7Fragment$fragmentType,
  FragmentResourceTest7Fragment$data,
>*/);
