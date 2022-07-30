/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b20c1bb9b94007df6b4afd759188d3da>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest6Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest6Fragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RelayResponseNormalizerTest6Fragment$fragmentType,
|};
export type RelayResponseNormalizerTest6Fragment$key = {
  +$data?: RelayResponseNormalizerTest6Fragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest6Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest6Fragment",
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
  (node/*: any*/).hash = "b36b98e9fcb8f74e81947212f0853117";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest6Fragment$fragmentType,
  RelayResponseNormalizerTest6Fragment$data,
>*/);
