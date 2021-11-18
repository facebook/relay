/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1177a86efc60c899435cda8174add0a7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest9Fragment$fragmentType: FragmentType;
export type DataCheckerTest9Fragment$ref = DataCheckerTest9Fragment$fragmentType;
export type DataCheckerTest9Fragment$data = {|
  +id: string,
  +firstName: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: DataCheckerTest9Fragment$fragmentType,
|};
export type DataCheckerTest9Fragment = DataCheckerTest9Fragment$data;
export type DataCheckerTest9Fragment$key = {
  +$data?: DataCheckerTest9Fragment$data,
  +$fragmentSpreads: DataCheckerTest9Fragment$fragmentType,
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
  (node/*: any*/).hash = "6dca1d534092112703bff683836ab29a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest9Fragment$fragmentType,
  DataCheckerTest9Fragment$data,
>*/);
