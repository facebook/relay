/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<791b197958c88180ecce149642100390>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type withProvidedVariablesTest2Fragment$fragmentType: FragmentType;
export type withProvidedVariablesTest2Fragment$data = {|
  +friends: ?{|
    +count?: ?number,
  |},
  +$fragmentType: withProvidedVariablesTest2Fragment$fragmentType,
|};
export type withProvidedVariablesTest2Fragment$key = {
  +$data?: withProvidedVariablesTest2Fragment$data,
  +$fragmentSpreads: withProvidedVariablesTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__provideNumberOfFriends"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "includeFriendsCount_"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "withProvidedVariablesTest2Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "__relay_internal__pv__provideNumberOfFriends"
        }
      ],
      "concreteType": "FriendsConnection",
      "kind": "LinkedField",
      "name": "friends",
      "plural": false,
      "selections": [
        {
          "condition": "includeFriendsCount_",
          "kind": "Condition",
          "passingValue": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "count",
              "storageKey": null
            }
          ]
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "dd39446c387abccfaaee8c9b5cd51754";
}

module.exports = ((node/*: any*/)/*: Fragment<
  withProvidedVariablesTest2Fragment$fragmentType,
  withProvidedVariablesTest2Fragment$data,
>*/);
