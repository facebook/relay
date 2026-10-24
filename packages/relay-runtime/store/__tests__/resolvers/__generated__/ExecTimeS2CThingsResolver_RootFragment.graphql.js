/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<303268bb36dc1519499cec1846431619>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ExecTimeS2CThingsResolver_RootFragment$fragmentType: FragmentType;
export type ExecTimeS2CThingsResolver_RootFragment$data = {
  readonly nodes: ?ReadonlyArray<?{
    readonly __typename: string,
    readonly id: string,
  }>,
  readonly $fragmentType: ExecTimeS2CThingsResolver_RootFragment$fragmentType,
};
export type ExecTimeS2CThingsResolver_RootFragment$key = {
  readonly $data?: ExecTimeS2CThingsResolver_RootFragment$data,
  readonly $fragmentSpreads: ExecTimeS2CThingsResolver_RootFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "ids"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "ExecTimeS2CThingsResolver_RootFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "ids",
          "variableName": "ids"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
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
          "name": "__typename",
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
  (node/*:: as any*/).hash = "d5fd443fe7845502467c1349dbe0bbc9";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ExecTimeS2CThingsResolver_RootFragment$fragmentType,
  ExecTimeS2CThingsResolver_RootFragment$data,
>*/);
