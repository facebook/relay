/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<32c1f3fbc2a47df12ab5ef8f4a651a8a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type preloadQueryDEPRECATEDTest_ProvidedVarFragment$fragmentType: FragmentType;
export type preloadQueryDEPRECATEDTest_ProvidedVarFragment$ref = preloadQueryDEPRECATEDTest_ProvidedVarFragment$fragmentType;
export type preloadQueryDEPRECATEDTest_ProvidedVarFragment$data = {|
  +name?: ?string,
  +firstName?: ?string,
  +lastName?: ?string,
  +username?: ?string,
  +$fragmentType: preloadQueryDEPRECATEDTest_ProvidedVarFragment$fragmentType,
|};
export type preloadQueryDEPRECATEDTest_ProvidedVarFragment = preloadQueryDEPRECATEDTest_ProvidedVarFragment$data;
export type preloadQueryDEPRECATEDTest_ProvidedVarFragment$key = {
  +$data?: preloadQueryDEPRECATEDTest_ProvidedVarFragment$data,
  +$fragmentSpreads: preloadQueryDEPRECATEDTest_ProvidedVarFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeFirstName"
    },
    {
      "kind": "RootArgument",
      "name": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeName"
    },
    {
      "kind": "RootArgument",
      "name": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipLastName"
    },
    {
      "kind": "RootArgument",
      "name": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipUsername"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "preloadQueryDEPRECATEDTest_ProvidedVarFragment",
  "selections": [
    {
      "condition": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeName",
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
      "condition": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeFirstName",
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
      "condition": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipLastName",
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
      "condition": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipUsername",
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
  (node/*: any*/).hash = "6ccd0faa2d0e7e65107135efa23e2de2";
}

module.exports = ((node/*: any*/)/*: Fragment<
  preloadQueryDEPRECATEDTest_ProvidedVarFragment$fragmentType,
  preloadQueryDEPRECATEDTest_ProvidedVarFragment$data,
>*/);
