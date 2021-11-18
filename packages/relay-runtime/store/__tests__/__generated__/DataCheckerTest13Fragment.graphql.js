/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<81a74975ebee10b972f144a3b5bd5b54>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest13Fragment$fragmentType: FragmentType;
export type DataCheckerTest13Fragment$ref = DataCheckerTest13Fragment$fragmentType;
export type DataCheckerTest13Fragment$data = {|
  +id: string,
  +firstName: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: DataCheckerTest13Fragment$fragmentType,
|};
export type DataCheckerTest13Fragment = DataCheckerTest13Fragment$data;
export type DataCheckerTest13Fragment$key = {
  +$data?: DataCheckerTest13Fragment$data,
  +$fragmentSpreads: DataCheckerTest13Fragment$fragmentType,
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
  "name": "DataCheckerTest13Fragment",
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
  (node/*: any*/).hash = "50733bf1cfc37963b99595be89d0cb01";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest13Fragment$fragmentType,
  DataCheckerTest13Fragment$data,
>*/);
