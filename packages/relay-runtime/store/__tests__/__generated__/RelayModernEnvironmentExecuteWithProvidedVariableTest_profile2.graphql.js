/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fb4dbe0af3aae7b87853d28f1af80708>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$data = {|
  +name?: ?string,
  +alternate_name?: ?string,
  +$fragmentType: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$key = {
  +$data?: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "kind": "RootArgument",
  "name": "__relay_internal__pv__RelayProvider_returnsTrue"
};
return {
  "argumentDefinitions": [
    (v0/*: any*/),
    (v0/*: any*/)
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2",
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
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "alternate_name",
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
  (node/*: any*/).hash = "fde1f4891ea7ab32c106e5209a512695";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$fragmentType,
  RelayModernEnvironmentExecuteWithProvidedVariableTest_profile2$data,
>*/);
