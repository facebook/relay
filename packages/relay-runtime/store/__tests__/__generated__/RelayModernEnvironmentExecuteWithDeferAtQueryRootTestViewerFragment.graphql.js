/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5122e7f64fcce3029a8f42e94ad6883e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment$data = {
  readonly viewer: ?{
    readonly isFbEmployee: ?boolean,
  },
  readonly $fragmentType: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment$fragmentType,
};
export type RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment",
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
          "name": "isFbEmployee",
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
  (node/*:: as any*/).hash = "6a50d7f82c9648be7bde3fbb647d1593";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment$fragmentType,
  RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment$data,
>*/);
