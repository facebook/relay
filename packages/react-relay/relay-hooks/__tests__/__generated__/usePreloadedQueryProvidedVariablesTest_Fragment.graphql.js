/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8068d4a9c39132eda92f934a91555e76>>
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
export type usePreloadedQueryProvidedVariablesTest_Fragment$data = {|
  +firstName?: ?string,
  +lastName?: ?string,
  +name?: ?string,
  +username?: ?string,
  +$fragmentType: usePreloadedQueryProvidedVariablesTest_Fragment$fragmentType,
|};
export type usePreloadedQueryProvidedVariablesTest_Fragment$key = {
  +$data?: usePreloadedQueryProvidedVariablesTest_Fragment$data,
  +$fragmentSpreads: usePreloadedQueryProvidedVariablesTest_Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "kind": "RootArgument",
  "name": "__relay_internal__pv__RelayProvider_returnsFalserelayprovider"
},
v1 = {
  "kind": "RootArgument",
  "name": "__relay_internal__pv__RelayProvider_returnsTruerelayprovider"
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
      "condition": "__relay_internal__pv__RelayProvider_returnsTruerelayprovider",
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
      "condition": "__relay_internal__pv__RelayProvider_returnsFalserelayprovider",
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
      "condition": "__relay_internal__pv__RelayProvider_returnsFalserelayprovider",
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
      "condition": "__relay_internal__pv__RelayProvider_returnsTruerelayprovider",
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
  (node/*: any*/).hash = "9aa04bed3938035b507ba1c0b03467b1";
}

module.exports = ((node/*: any*/)/*: Fragment<
  usePreloadedQueryProvidedVariablesTest_Fragment$fragmentType,
  usePreloadedQueryProvidedVariablesTest_Fragment$data,
>*/);
