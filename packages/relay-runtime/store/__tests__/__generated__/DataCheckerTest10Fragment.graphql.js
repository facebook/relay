/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e899db448b7b9b71dacade024b9924f7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest10Fragment$fragmentType: FragmentType;
export type DataCheckerTest10Fragment$ref = DataCheckerTest10Fragment$fragmentType;
export type DataCheckerTest10Fragment$data = {|
  +id: string,
  +firstName: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: DataCheckerTest10Fragment$fragmentType,
|};
export type DataCheckerTest10Fragment = DataCheckerTest10Fragment$data;
export type DataCheckerTest10Fragment$key = {
  +$data?: DataCheckerTest10Fragment$data,
  +$fragmentSpreads: DataCheckerTest10Fragment$fragmentType,
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
  "name": "DataCheckerTest10Fragment",
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
  (node/*: any*/).hash = "93200a427ae403b5c43332f3cd3d0f7a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest10Fragment$fragmentType,
  DataCheckerTest10Fragment$data,
>*/);
