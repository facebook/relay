/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5febdbb7f65ef9573f59dd2266fd1a3e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment$data = {
  readonly viewer: ?{
    readonly primaryEmail: ?string,
  },
  readonly $fragmentType: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment$fragmentType,
};
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment",
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
          "kind": "ScalarField",
          "name": "primaryEmail",
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
  (node/*:: as any*/).hash = "1dcf0d41aa7448f09437c40878805988";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment$fragmentType,
  RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment$data,
>*/);
