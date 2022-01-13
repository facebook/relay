/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<105cf18a3cf1842bb97b51c2bc0056af>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest_pvFragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest_pvFragment$ref = RelayResponseNormalizerTest_pvFragment$fragmentType;
export type RelayResponseNormalizerTest_pvFragment$data = {|
  +name?: ?string,
  +firstName?: ?string,
  +lastName?: ?string,
  +username?: ?string,
  +$fragmentType: RelayResponseNormalizerTest_pvFragment$fragmentType,
|};
export type RelayResponseNormalizerTest_pvFragment = RelayResponseNormalizerTest_pvFragment$data;
export type RelayResponseNormalizerTest_pvFragment$key = {
  +$data?: RelayResponseNormalizerTest_pvFragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest_pvFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__RelayResponseNormalizerTest_pvFragment__includeFirstName"
    },
    {
      "kind": "RootArgument",
      "name": "__RelayResponseNormalizerTest_pvFragment__includeName"
    },
    {
      "kind": "RootArgument",
      "name": "__RelayResponseNormalizerTest_pvFragment__skipLastName"
    },
    {
      "kind": "RootArgument",
      "name": "__RelayResponseNormalizerTest_pvFragment__skipUsername"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest_pvFragment",
  "selections": [
    {
      "condition": "__RelayResponseNormalizerTest_pvFragment__includeName",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ]
    },
    {
      "condition": "__RelayResponseNormalizerTest_pvFragment__includeFirstName",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "firstName",
          "storageKey": null
        }
      ]
    },
    {
      "condition": "__RelayResponseNormalizerTest_pvFragment__skipLastName",
      "kind": "Condition",
      "passingValue": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "lastName",
          "storageKey": null
        }
      ]
    },
    {
      "condition": "__RelayResponseNormalizerTest_pvFragment__skipUsername",
      "kind": "Condition",
      "passingValue": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "username",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "bd90b1b55b33983116d3a7541c2e3ac0";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest_pvFragment$fragmentType,
  RelayResponseNormalizerTest_pvFragment$data,
>*/);
