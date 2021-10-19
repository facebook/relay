/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e1bf8349523af205859d16d68172a66b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$fragmentType: RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$ref;
export type RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$ref,
|};
export type RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$data = RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment;
export type RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$key = {
  +$data?: RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$data,
  +$fragmentRefs: RelayModernEnvironmentCheckWithGlobalInvalidationTestUserFragment$ref,
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
  (node/*: any*/).hash = "ccdce8c193c52f1dfab84a39ef9d54a8";
}

module.exports = node;
