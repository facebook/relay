/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dac4527f27e0495c82b6d0da5bb11795>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderExecResolversTestUser__id$fragmentType: FragmentType;
export type RelayReaderExecResolversTestUser__id$data = {
  readonly id: string,
  readonly $fragmentType: RelayReaderExecResolversTestUser__id$fragmentType,
};
export type RelayReaderExecResolversTestUser__id$key = {
  readonly $data?: RelayReaderExecResolversTestUser__id$data,
  readonly $fragmentSpreads: RelayReaderExecResolversTestUser__id$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderExecResolversTestUser__id",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "RelayReaderExecResolversTestUser",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderExecResolversTestUser__id$fragmentType,
  RelayReaderExecResolversTestUser__id$data,
>*/);
