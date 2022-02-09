/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e8ab123dfebb2905c34972a8bde52de5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
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
  (node/*: any*/).hash = "c2b81707cf4c3d10cee30467951ddf99";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$fragmentType,
  RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$data,
>*/);
