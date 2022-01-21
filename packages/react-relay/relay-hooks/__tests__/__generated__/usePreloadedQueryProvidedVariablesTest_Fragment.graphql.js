/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f4791e085c218e1b9c4fefa4b25e44dd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type usePreloadedQueryProvidedVariablesTest_Fragment$fragmentType: FragmentType;
export type usePreloadedQueryProvidedVariablesTest_Fragment$ref = usePreloadedQueryProvidedVariablesTest_Fragment$fragmentType;
export type usePreloadedQueryProvidedVariablesTest_Fragment$data = {|
  +name?: ?string,
  +firstName?: ?string,
  +lastName?: ?string,
  +username?: ?string,
  +$fragmentType: usePreloadedQueryProvidedVariablesTest_Fragment$fragmentType,
|};
export type usePreloadedQueryProvidedVariablesTest_Fragment = usePreloadedQueryProvidedVariablesTest_Fragment$data;
export type usePreloadedQueryProvidedVariablesTest_Fragment$key = {
  +$data?: usePreloadedQueryProvidedVariablesTest_Fragment$data,
  +$fragmentSpreads: usePreloadedQueryProvidedVariablesTest_Fragment$fragmentType,
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
  "name": "usePreloadedQueryProvidedVariablesTest_Fragment",
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
  (node/*: any*/).hash = "bd07e5c78d2238a6262a40f596363fc6";
}

module.exports = ((node/*: any*/)/*: Fragment<
  usePreloadedQueryProvidedVariablesTest_Fragment$fragmentType,
  usePreloadedQueryProvidedVariablesTest_Fragment$data,
>*/);
