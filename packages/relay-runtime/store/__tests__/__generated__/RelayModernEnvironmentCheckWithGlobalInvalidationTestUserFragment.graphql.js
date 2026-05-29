/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7cc5930c4b83591a4e3869f23a25511f>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$data = {
  readonly profilePicture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$fragmentType,
};
export type RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$key = {
  readonly $data?: RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "size",
          "variableName": "size"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profilePicture",
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
  (node/*:: as any*/).hash = "ccdce8c193c52f1dfab84a39ef9d54a8";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$fragmentType,
  RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$data,
>*/);
