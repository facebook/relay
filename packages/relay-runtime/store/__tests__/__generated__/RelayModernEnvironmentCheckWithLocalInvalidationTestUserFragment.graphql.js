/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3921ea83e773a466e119a2d5a65fbaa0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$fragmentType,
|};
export type RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$key = {
  +$data?: RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$fragmentType,
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
  "name": "RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment",
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
  (node/*: any*/).hash = "33d1beb6c101215ec2db0329b5df2e20";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$fragmentType,
  RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$data,
>*/);
