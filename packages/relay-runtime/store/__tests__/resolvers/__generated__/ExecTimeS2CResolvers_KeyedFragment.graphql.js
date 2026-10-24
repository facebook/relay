/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<63f08c393348ec7eb68840e4265d3d20>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ExecTimeS2CResolvers_KeyedFragment$fragmentType: FragmentType;
export type ExecTimeS2CResolvers_KeyedFragment$data = {
  readonly alternate_name: ?string,
  readonly id: string,
  readonly $fragmentType: ExecTimeS2CResolvers_KeyedFragment$fragmentType,
};
export type ExecTimeS2CResolvers_KeyedFragment$key = {
  readonly $data?: ExecTimeS2CResolvers_KeyedFragment$data,
  readonly $fragmentSpreads: ExecTimeS2CResolvers_KeyedFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ExecTimeS2CResolvers_KeyedFragment",
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
      "name": "alternate_name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "028f1c7196a67ecf6b39b4b6e38f6d69";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ExecTimeS2CResolvers_KeyedFragment$fragmentType,
  ExecTimeS2CResolvers_KeyedFragment$data,
>*/);
