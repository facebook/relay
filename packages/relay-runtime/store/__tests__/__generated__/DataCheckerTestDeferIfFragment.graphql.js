/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTestDeferIfFragment$fragmentType: FragmentType;
export type DataCheckerTestDeferIfFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: DataCheckerTestDeferIfFragment$fragmentType,
|};
export type DataCheckerTestDeferIfFragment$key = {
  +$data?: DataCheckerTestDeferIfFragment$data,
  +$fragmentSpreads: DataCheckerTestDeferIfFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTestDeferIfFragment",
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
  (node/*:: as any*/).hash = "datachecker_test_defer_if_fragment";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  DataCheckerTestDeferIfFragment$fragmentType,
  DataCheckerTestDeferIfFragment$data,
>*/);
