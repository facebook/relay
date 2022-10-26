/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6436d7b7237709b0e1dc16a0d4bb8cdf>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type SomeDeeplyNestedFragment$fragmentType: FragmentType;
export type SomeDeeplyNestedFragment$data = {|
  +name: ?string,
  +$fragmentType: SomeDeeplyNestedFragment$fragmentType,
|};
export type SomeDeeplyNestedFragment$key = {
  +$data?: SomeDeeplyNestedFragment$data,
  +$fragmentSpreads: SomeDeeplyNestedFragment$fragmentType,
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
  (node/*: any*/).hash = "9ba5995cbdde023865ec47ff03adfdce";
}

module.exports = ((node/*: any*/)/*: Fragment<
  SomeDeeplyNestedFragment$fragmentType,
  SomeDeeplyNestedFragment$data,
>*/);
