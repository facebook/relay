/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<201bb3f5601fad166a1c1fdb89bff377>>
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

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "kind": "RootArgument",
  "name": "__relay_internal__pv__RelayProvider_returnsFalse"
},
v1 = {
  "kind": "RootArgument",
  "name": "__relay_internal__pv__RelayProvider_returnsTrue"
};
return {
  "argumentDefinitions": [
    (v0/*: any*/),
    (v0/*: any*/),
    (v1/*: any*/),
    (v1/*: any*/)
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "preloadQueryDEPRECATEDTest_ProvidedVarFragment",
  "selections": [
    {
      "condition": "__relay_internal__pv__RelayProvider_returnsTrue",
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
      "condition": "__relay_internal__pv__RelayProvider_returnsFalse",
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
      "condition": "__relay_internal__pv__RelayProvider_returnsFalse",
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
      "condition": "__relay_internal__pv__RelayProvider_returnsTrue",
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
})();

if (__DEV__) {
  (node/*: any*/).hash = "6ccd0faa2d0e7e65107135efa23e2de2";
}

module.exports = ((node/*: any*/)/*: Fragment<
  preloadQueryDEPRECATEDTest_ProvidedVarFragment$fragmentType,
  preloadQueryDEPRECATEDTest_ProvidedVarFragment$data,
>*/);
