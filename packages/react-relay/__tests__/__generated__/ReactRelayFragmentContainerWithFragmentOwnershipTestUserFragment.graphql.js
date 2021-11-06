/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<52e49b6c4b5ba36dff44c6a9f04ebb5f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment$ref: FragmentReference;
declare export opaque type ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment$fragmentType: ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment$ref;
export type ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment = {|
  +id: string,
  +name?: ?string,
  +$fragmentRefs: ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment$ref,
  +$refType: ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment$ref,
|};
export type ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment$data = ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment;
export type ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment$key = {
  +$data?: ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment$data,
  +$fragmentRefs: ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment$ref,
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
  "name": "ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment",
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
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "a6f390ce39a0736709e18601023d1a20";
}

module.exports = node;
