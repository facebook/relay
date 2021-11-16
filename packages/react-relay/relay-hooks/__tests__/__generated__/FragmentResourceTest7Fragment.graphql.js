/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<03a7276c596c60f8cd75bb222d3217ea>>
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
export type FragmentResourceTest7Fragment$ref = FragmentResourceTest7Fragment$fragmentType;
export type FragmentResourceTest7Fragment$data = $ReadOnlyArray<{|
  +id: string,
  +$refType: FragmentResourceTest7Fragment$fragmentType,
  +$fragmentType: FragmentResourceTest7Fragment$fragmentType,
|}>;
export type FragmentResourceTest7Fragment = FragmentResourceTest7Fragment$data;
export type FragmentResourceTest7Fragment$key = $ReadOnlyArray<{
  +$data?: FragmentResourceTest7Fragment$data,
  +$fragmentRefs: FragmentResourceTest7Fragment$fragmentType,
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
