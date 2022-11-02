/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<604e85b6872613418b0e60e6863355f4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest4Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest4Fragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RelayResponseNormalizerTest4Fragment$fragmentType,
|};
export type RelayResponseNormalizerTest4Fragment$key = {
  +$data?: RelayResponseNormalizerTest4Fragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest4Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest4Fragment",
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
  (node/*: any*/).hash = "b6997ee42173a86ee78c7058892f90f7";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest4Fragment$fragmentType,
  RelayResponseNormalizerTest4Fragment$data,
>*/);
