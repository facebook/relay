/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<43f0eb26486b7f794194485abda83df9>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeQueryTestToPromiseFragment$fragmentType: FragmentType;
export type observeQueryTestToPromiseFragment$data = {
  readonly name: ?string,
  readonly $fragmentType: observeQueryTestToPromiseFragment$fragmentType,
};
export type observeQueryTestToPromiseFragment$key = {
  readonly $data?: observeQueryTestToPromiseFragment$data,
  readonly $fragmentSpreads: observeQueryTestToPromiseFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "observeQueryTestToPromiseFragment",
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
  (node/*:: as any*/).hash = "9d69f728a12d61512c227f5014a447cd";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  observeQueryTestToPromiseFragment$fragmentType,
  observeQueryTestToPromiseFragment$data,
>*/);
