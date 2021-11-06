/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c784a19258280933052f468caca3eb4c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$fragmentType: RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$ref;
export type RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$ref,
|};
export type RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$data = RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment;
export type RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$key = {
  +$data?: RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$data,
  +$fragmentRefs: RelayModernEnvironmentCheckWithLocalInvalidationTestUserFragment$ref,
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

module.exports = node;
