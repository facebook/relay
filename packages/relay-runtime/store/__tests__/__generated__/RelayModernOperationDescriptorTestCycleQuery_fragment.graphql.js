/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4f41070e742c68a31e918bbc536d93d8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernOperationDescriptorTestCycleQuery_fragment$fragmentType: FragmentType;
export type RelayModernOperationDescriptorTestCycleQuery_fragment$data = {|
  +name?: ?string,
  +$fragmentType: RelayModernOperationDescriptorTestCycleQuery_fragment$fragmentType,
|};
export type RelayModernOperationDescriptorTestCycleQuery_fragment$key = {
  +$data?: RelayModernOperationDescriptorTestCycleQuery_fragment$data,
  +$fragmentSpreads: RelayModernOperationDescriptorTestCycleQuery_fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__RelayProvider_returnsCyclicrelayprovider"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernOperationDescriptorTestCycleQuery_fragment",
  "selections": [
    {
      "condition": "__relay_internal__pv__RelayProvider_returnsCyclicrelayprovider",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "60b6e417d668bb21b549b789b18b5759";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernOperationDescriptorTestCycleQuery_fragment$fragmentType,
  RelayModernOperationDescriptorTestCycleQuery_fragment$data,
>*/);
