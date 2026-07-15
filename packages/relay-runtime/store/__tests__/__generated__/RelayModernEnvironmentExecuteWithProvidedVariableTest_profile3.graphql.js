/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c551ec2a4a3e80f6436cccc6bd49e994>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$data = {
  readonly profile_picture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$fragmentType,
};
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__RelayProvider_pictureScalerelayprovider"
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
          "variableName": "__relay_internal__pv__RelayProvider_pictureScalerelayprovider"
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
  (node/*:: as any*/).hash = "1cc193457b42af7ee60e40a7523bf29b";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$fragmentType,
  RelayModernEnvironmentExecuteWithProvidedVariableTest_profile3$data,
>*/);
