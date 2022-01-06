/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b067a28723f9937c1ff93ac1d443e4be>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$ref = RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$fragmentType;
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$data = {|
  +name?: ?string,
  +alternate_name?: ?string,
  +$fragmentType: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2 = RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$data;
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$key = {
  +$data?: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeAlternateName"
    },
    {
      "kind": "RootArgument",
      "name": "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeName"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2",
  "selections": [
    {
      "condition": "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeName",
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
    },
    {
      "condition": "__RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2__includeAlternateName",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "alternate_name",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "6addc0949b7da8299cadeee8bb0e067d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$fragmentType,
  RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$data,
>*/);
