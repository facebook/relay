/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<308fe0c6aa43fcf82bd811bc905aa500>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type withProvidedVariablesTest1Fragment$fragmentType: FragmentType;
export type withProvidedVariablesTest1Fragment$data = {|
  +friends: ?{|
    +count: ?number,
  |},
  +$fragmentType: withProvidedVariablesTest1Fragment$fragmentType,
|};
export type withProvidedVariablesTest1Fragment$key = {
  +$data?: withProvidedVariablesTest1Fragment$data,
  +$fragmentSpreads: withProvidedVariablesTest1Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__provideNumberOfFriendsrelayprovider"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "withProvidedVariablesTest1Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "__relay_internal__pv__provideNumberOfFriendsrelayprovider"
        }
      ],
      "concreteType": "FriendsConnection",
      "kind": "LinkedField",
      "name": "friends",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "count",
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
  (node/*: any*/).hash = "4b45df14eedaad92201cd61de0b39a84";
}

module.exports = ((node/*: any*/)/*: Fragment<
  withProvidedVariablesTest1Fragment$fragmentType,
  withProvidedVariablesTest1Fragment$data,
>*/);
