/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<266859c98d9b29b87cf9b1599b7555f1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest8Fragment$fragmentType: FragmentType;
export type DataCheckerTest8Fragment$ref = DataCheckerTest8Fragment$fragmentType;
export type DataCheckerTest8Fragment$data = {|
  +id: string,
  +firstName: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: DataCheckerTest8Fragment$fragmentType,
|};
export type DataCheckerTest8Fragment = DataCheckerTest8Fragment$data;
export type DataCheckerTest8Fragment$key = {
  +$data?: DataCheckerTest8Fragment$data,
  +$fragmentSpreads: DataCheckerTest8Fragment$fragmentType,
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
  "name": "DataCheckerTest8Fragment",
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
  (node/*: any*/).hash = "6c6bcf6b7ff037a01507efc976e077cb";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest8Fragment$fragmentType,
  DataCheckerTest8Fragment$data,
>*/);
