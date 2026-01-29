/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c4f8c1f50e9e2613b133e9bc93c667e6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type fetchQueryTestFragment$fragmentType: FragmentType;
export type fetchQueryTestFragment$data = {|
  +name: string,
  +$fragmentType: fetchQueryTestFragment$fragmentType,
|};
export type fetchQueryTestFragment$key = {
  +$data?: fetchQueryTestFragment$data,
  +$fragmentSpreads: fetchQueryTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fetchQueryTestFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      "action": "THROW"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "7f2fe4c26db9bf66d873fc1d67d8b378";
}

module.exports = ((node/*: any*/)/*: Fragment<
  fetchQueryTestFragment$fragmentType,
  fetchQueryTestFragment$data,
>*/);
