/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0935cfdc134dc9b740b6e4212a3f5624>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentApplyMutationTestFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentApplyMutationTestFragment$data = {|
  +body: ?{|
    +text: ?string,
  |},
  +id: string,
  +$fragmentType: RelayModernEnvironmentApplyMutationTestFragment$fragmentType,
|};
export type RelayModernEnvironmentApplyMutationTestFragment$key = {
  +$data?: RelayModernEnvironmentApplyMutationTestFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentApplyMutationTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentApplyMutationTestFragment",
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
      "concreteType": "Text",
      "kind": "LinkedField",
      "name": "body",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Comment",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "d2674d63012707069f7de0e0e3449a02";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentApplyMutationTestFragment$fragmentType,
  RelayModernEnvironmentApplyMutationTestFragment$data,
>*/);
