/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<878e0c4e3e9f741a6d8e3048d025e78d>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ExecTimeS2CThingsResolver_LabelFragment$fragmentType: FragmentType;
export type ExecTimeS2CThingsResolver_LabelFragment$data = {
  readonly id: string,
  readonly $fragmentType: ExecTimeS2CThingsResolver_LabelFragment$fragmentType,
};
export type ExecTimeS2CThingsResolver_LabelFragment$key = {
  readonly $data?: ExecTimeS2CThingsResolver_LabelFragment$data,
  readonly $fragmentSpreads: ExecTimeS2CThingsResolver_LabelFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ExecTimeS2CThingsResolver_LabelFragment",
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
  "type": "IExecTimeS2CThing",
  "abstractKey": "__isIExecTimeS2CThing"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "10191aae6ba78ec51ffe40b114c4be54";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ExecTimeS2CThingsResolver_LabelFragment$fragmentType,
  ExecTimeS2CThingsResolver_LabelFragment$data,
>*/);
