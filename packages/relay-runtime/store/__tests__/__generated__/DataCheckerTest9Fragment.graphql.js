/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8c4cd9ab4cd6e3904d0d4c69bd61dd50>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest9Fragment$fragmentType: FragmentType;
export type DataCheckerTest9Fragment$data = {
  readonly firstName: ?string,
  readonly id: string,
  readonly profilePicture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: DataCheckerTest9Fragment$fragmentType,
};
export type DataCheckerTest9Fragment$key = {
  readonly $data?: DataCheckerTest9Fragment$data,
  readonly $fragmentSpreads: DataCheckerTest9Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest9Fragment",
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
      "name": "firstName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "size",
          "variableName": "size"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profilePicture",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "6dca1d534092112703bff683836ab29a";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  DataCheckerTest9Fragment$fragmentType,
  DataCheckerTest9Fragment$data,
>*/);
