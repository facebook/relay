/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2600186b3b1e8a5cdb4d6d4fcd7ba97d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$fragmentType: FragmentType;
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$data = {|
  +username: ?string,
  +$fragmentType: RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$fragmentType,
|};
export type RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$key = {
  +$data?: RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$data,
  +$fragmentSpreads: RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$fragmentType,
  RelayModernFragmentSpecResolverWithFragmentOwnershipTestNestedUserFragment$data,
>*/);
