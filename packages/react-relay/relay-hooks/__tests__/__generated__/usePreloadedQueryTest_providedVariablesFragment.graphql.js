/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1ee8a299294beed1fdf641c4695dcde5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type usePreloadedQueryTest_providedVariablesFragment$fragmentType: FragmentType;
export type usePreloadedQueryTest_providedVariablesFragment$ref = usePreloadedQueryTest_providedVariablesFragment$fragmentType;
export type usePreloadedQueryTest_providedVariablesFragment$data = {|
  +name?: ?string,
  +firstName?: ?string,
  +lastName?: ?string,
  +username?: ?string,
  +$fragmentType: usePreloadedQueryTest_providedVariablesFragment$fragmentType,
|};
export type usePreloadedQueryTest_providedVariablesFragment = usePreloadedQueryTest_providedVariablesFragment$data;
export type usePreloadedQueryTest_providedVariablesFragment$key = {
  +$data?: usePreloadedQueryTest_providedVariablesFragment$data,
  +$fragmentSpreads: usePreloadedQueryTest_providedVariablesFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "kind": "RootArgument",
  "name": "__pv__RelayProvider_returnsFalse"
},
v1 = {
  "kind": "RootArgument",
  "name": "__pv__RelayProvider_returnsTrue"
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
  "name": "usePreloadedQueryTest_providedVariablesFragment",
  "selections": [
    {
      "condition": "__pv__RelayProvider_returnsTrue",
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
      "condition": "__pv__RelayProvider_returnsFalse",
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
      "condition": "__pv__RelayProvider_returnsFalse",
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
      "condition": "__pv__RelayProvider_returnsTrue",
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
  (node/*: any*/).hash = "e02ef8920fcd8c557fdf776afe9df5e5";
}

module.exports = ((node/*: any*/)/*: Fragment<
  usePreloadedQueryTest_providedVariablesFragment$fragmentType,
  usePreloadedQueryTest_providedVariablesFragment$data,
>*/);
