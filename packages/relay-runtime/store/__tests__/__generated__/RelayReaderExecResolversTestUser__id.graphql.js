/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<381da6902b772bf44899bff2d4ddb33b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderExecResolversTestUser__id$fragmentType: FragmentType;
export type RelayReaderExecResolversTestUser__id$data = {|
  +id: string,
  +$fragmentType: RelayReaderExecResolversTestUser__id$fragmentType,
|};
export type RelayReaderExecResolversTestUser__id$key = {
  +$data?: RelayReaderExecResolversTestUser__id$data,
  +$fragmentSpreads: RelayReaderExecResolversTestUser__id$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderExecResolversTestUser__id$fragmentType,
  RelayReaderExecResolversTestUser__id$data,
>*/);
