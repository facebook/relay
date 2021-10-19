/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<632c5e1aafe8f0abc93d93945cc52e96>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$ref: FragmentReference;
declare export opaque type RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$fragmentType: RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$ref;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment = {|
  +username: ?string,
  +$refType: RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$ref,
|};
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$data = RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$key = {
  +$data?: RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$data,
  +$fragmentRefs: RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment",
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
  (node/*: any*/).hash = "4499f41f0e4b103713df9c1944d7a3ae";
}

module.exports = node;
