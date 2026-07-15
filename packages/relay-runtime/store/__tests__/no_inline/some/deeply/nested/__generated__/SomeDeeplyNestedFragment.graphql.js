/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7d03a8ab0f9ac83c211ab58774ab9ec9>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type SomeDeeplyNestedFragment$fragmentType: FragmentType;
export type SomeDeeplyNestedFragment$data = {
  readonly name: ?string,
  readonly $fragmentType: SomeDeeplyNestedFragment$fragmentType,
};
export type SomeDeeplyNestedFragment$key = {
  readonly $data?: SomeDeeplyNestedFragment$data,
  readonly $fragmentSpreads: SomeDeeplyNestedFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SomeDeeplyNestedFragment",
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
  (node/*:: as any*/).hash = "9ba5995cbdde023865ec47ff03adfdce";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  SomeDeeplyNestedFragment$fragmentType,
  SomeDeeplyNestedFragment$data,
>*/);
