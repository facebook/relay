/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a225d1655ff4aae9d2c437c458f502ad>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment$fragmentType: FragmentType;
export type RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment$data = {|
  +alternate_name: ?string,
  +id: string,
  +name: ?string,
  +$fragmentType: RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment$fragmentType,
|};
export type RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment$key = {
  +$data?: RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment$data,
  +$fragmentSpreads: RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "alternate_name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "9334c3d6a2dff00bc36733406c6b046b";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment$fragmentType,
  RelayModernFragmentSpecResolverRelayErrorHandlingTestUserFragment$data,
>*/);
