/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a5dc7c4d00193df5a47c36461540b600>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type usePreloadedQueryProvidedVariablesTest_badFragment$fragmentType: FragmentType;
export type usePreloadedQueryProvidedVariablesTest_badFragment$data = {|
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: usePreloadedQueryProvidedVariablesTest_badFragment$fragmentType,
|};
export type usePreloadedQueryProvidedVariablesTest_badFragment$key = {
  +$data?: usePreloadedQueryProvidedVariablesTest_badFragment$data,
  +$fragmentSpreads: usePreloadedQueryProvidedVariablesTest_badFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__RelayProvider_impure"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "usePreloadedQueryProvidedVariablesTest_badFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "scale",
          "variableName": "__relay_internal__pv__RelayProvider_impure"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
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
  (node/*: any*/).hash = "04a0f272433970db897da981fd55059b";
}

module.exports = ((node/*: any*/)/*: Fragment<
  usePreloadedQueryProvidedVariablesTest_badFragment$fragmentType,
  usePreloadedQueryProvidedVariablesTest_badFragment$data,
>*/);
