/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<574ad38ed036742202d7335021be10e8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest3Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest3Fragment$ref = RelayResponseNormalizerTest3Fragment$fragmentType;
export type RelayResponseNormalizerTest3Fragment$data = {|
  +id: string,
  +name: ?string,
  +$refType: RelayResponseNormalizerTest3Fragment$fragmentType,
  +$fragmentType: RelayResponseNormalizerTest3Fragment$fragmentType,
|};
export type RelayResponseNormalizerTest3Fragment = RelayResponseNormalizerTest3Fragment$data;
export type RelayResponseNormalizerTest3Fragment$key = {
  +$data?: RelayResponseNormalizerTest3Fragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest3Fragment$fragmentType,
  +$fragmentSpreads: RelayResponseNormalizerTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest3Fragment",
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
  (node/*: any*/).hash = "561328cf17808941f0e564b834c019dc";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest3Fragment$fragmentType,
  RelayResponseNormalizerTest3Fragment$data,
>*/);
