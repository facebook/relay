/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fb632ec930082c00c3c0ccb1c78e9842>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$ref: FragmentReference;
declare export opaque type RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$fragmentType: RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$ref;
export type RelayMockEnvironmentWithComponentsTestProminentSolutionFragment = {|
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$ref,
|};
export type RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$data = RelayMockEnvironmentWithComponentsTestProminentSolutionFragment;
export type RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$key = {
  +$data?: RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$data,
  +$fragmentRefs: RelayMockEnvironmentWithComponentsTestProminentSolutionFragment$ref,
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

module.exports = node;
