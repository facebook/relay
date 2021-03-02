/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d5fd7dfca53a94e8c2c6d7a486f4349e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayFragmentContainerTestUserFragment$ref: FragmentReference;
declare export opaque type ReactRelayFragmentContainerTestUserFragment$fragmentType: ReactRelayFragmentContainerTestUserFragment$ref;
export type ReactRelayFragmentContainerTestUserFragment = {|
  +id: string,
  +name?: ?string,
  +$refType: ReactRelayFragmentContainerTestUserFragment$ref,
|};
export type ReactRelayFragmentContainerTestUserFragment$data = ReactRelayFragmentContainerTestUserFragment;
export type ReactRelayFragmentContainerTestUserFragment$key = {
  +$data?: ReactRelayFragmentContainerTestUserFragment$data,
  +$fragmentRefs: ReactRelayFragmentContainerTestUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": true,
      "kind": "LocalArgument",
      "name": "cond"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayFragmentContainerTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "condition": "cond",
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
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "ca03eeae7ce7ae5acb7539decc004c17";
}

module.exports = node;
