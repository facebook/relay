/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ce65cdd7af93fcb1807ea55d3525bd3b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment$ref: FragmentReference;
declare export opaque type ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment$fragmentType: ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment$ref;
export type ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment = {|
  +username: ?string,
  +$refType: ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment$ref,
|};
export type ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment$data = ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment;
export type ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment$key = {
  +$data?: ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment$data,
  +$fragmentRefs: ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "696fd5eeae83e4817dbea8b08ef65786";
}

module.exports = node;
