/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<53391eecb32e3b054a7123f2754c70fb>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment$data = {
  readonly viewer: ?{
    readonly account_user: ?{
      readonly name: ?string,
    },
  },
  readonly $fragmentType: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment$fragmentType,
};
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Viewer",
      "kind": "LinkedField",
      "name": "viewer",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "account_user",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "fe783ac8b5de2182ee8aeaf8c26f59b1";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment$fragmentType,
  RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment$data,
>*/);
