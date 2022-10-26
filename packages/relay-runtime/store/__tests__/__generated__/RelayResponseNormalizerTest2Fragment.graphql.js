/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<87e67221eb8fb7b79b0573ce715d48e0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest2Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest2Fragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RelayResponseNormalizerTest2Fragment$fragmentType,
|};
export type RelayResponseNormalizerTest2Fragment$key = {
  +$data?: RelayResponseNormalizerTest2Fragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest2Fragment",
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
  (node/*: any*/).hash = "d0fabdf19c8fb15f941fd3e6b6f272e9";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest2Fragment$fragmentType,
  RelayResponseNormalizerTest2Fragment$data,
>*/);
