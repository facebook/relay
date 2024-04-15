/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9636d86db4beea4fdb8a20bb27fb9e85>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type Cat__id$fragmentType: FragmentType;
export type Cat__id$data = {|
  +id: string,
  +$fragmentType: Cat__id$fragmentType,
|};
export type Cat__id$key = {
  +$data?: Cat__id$data,
  +$fragmentSpreads: Cat__id$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Cat__id",
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
  "type": "Cat",
  "abstractKey": null
};

module.exports = ((node/*: any*/)/*: Fragment<
  Cat__id$fragmentType,
  Cat__id$data,
>*/);
