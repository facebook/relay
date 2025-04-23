/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<866486fad21b6f203e5d569bbfa5816a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeQueryTestToPromiseFragment$fragmentType: FragmentType;
export type observeQueryTestToPromiseFragment$data = {|
  +name: ?string,
  +$fragmentType: observeQueryTestToPromiseFragment$fragmentType,
|};
export type observeQueryTestToPromiseFragment$key = {
  +$data?: observeQueryTestToPromiseFragment$data,
  +$fragmentSpreads: observeQueryTestToPromiseFragment$fragmentType,
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
  (node/*: any*/).hash = "9d69f728a12d61512c227f5014a447cd";
}

module.exports = ((node/*: any*/)/*: Fragment<
  observeQueryTestToPromiseFragment$fragmentType,
  observeQueryTestToPromiseFragment$data,
>*/);
