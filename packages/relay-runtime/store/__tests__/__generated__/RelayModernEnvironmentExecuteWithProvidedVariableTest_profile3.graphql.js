/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3485120561e25efc0749dfddc22e33c5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$ref = RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$fragmentType;
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$data = {|
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3 = RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$data;
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$key = {
  +$data?: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__RelayProvider_pictureScale"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "scale",
          "variableName": "__relay_internal__pv__RelayProvider_pictureScale"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "29eac2c27a8f5ab425403af0bd3ff18c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$fragmentType,
  RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$data,
>*/);
