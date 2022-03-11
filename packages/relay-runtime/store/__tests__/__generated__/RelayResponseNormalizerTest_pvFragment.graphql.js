/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c7bc2b332a6bc8cba410a91bb558c939>>
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
export type RelayResponseNormalizerTest_pvFragment$data = {|
  +firstName?: ?string,
  +lastName?: ?string,
  +name?: ?string,
  +username?: ?string,
  +$fragmentType: RelayResponseNormalizerTest_pvFragment$fragmentType,
|};
export type RelayResponseNormalizerTest_pvFragment$key = {
  +$data?: RelayResponseNormalizerTest_pvFragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest_pvFragment$fragmentType,
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
  "name": "RelayResponseNormalizerTest_pvFragment",
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
  (node/*: any*/).hash = "bd90b1b55b33983116d3a7541c2e3ac0";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest_pvFragment$fragmentType,
  RelayResponseNormalizerTest_pvFragment$data,
>*/);
