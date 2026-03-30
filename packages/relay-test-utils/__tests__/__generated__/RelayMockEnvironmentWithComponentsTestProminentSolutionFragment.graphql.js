/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fb3078494f8352e5f46bedb38eb94d69>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$fragmentType: FragmentType;
export type RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$data = {|
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$fragmentType,
|};
export type RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$key = {
  +$data?: RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$data,
  +$fragmentSpreads: RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "scale"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockEnvironmentWithComponentsTestProminentSolutionFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "scale",
          "variableName": "scale"
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
  (node/*:: as any*/).hash = "c2b81707cf4c3d10cee30467951ddf99";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$fragmentType,
  RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$data,
>*/);
