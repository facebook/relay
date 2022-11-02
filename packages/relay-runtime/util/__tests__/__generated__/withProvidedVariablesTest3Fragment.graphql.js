/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<57108d3d49e3db97a089f1d609c729b4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type withProvidedVariablesTest3Fragment$fragmentType: FragmentType;
export type withProvidedVariablesTest3Fragment$data = {|
  +friends: ?{|
    +count: ?number,
  |},
  +name?: ?string,
  +$fragmentType: withProvidedVariablesTest3Fragment$fragmentType,
|};
export type withProvidedVariablesTest3Fragment$key = {
  +$data?: withProvidedVariablesTest3Fragment$data,
  +$fragmentSpreads: withProvidedVariablesTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__provideIncludeUserNamesrelayprovider"
    },
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__provideNumberOfFriendsrelayprovider"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "withProvidedVariablesTest3Fragment",
  "selections": [
    {
      "condition": "__relay_internal__pv__provideIncludeUserNamesrelayprovider",
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
  (node/*: any*/).hash = "a26a56e1b372deedefdea2a2e89af943";
}

module.exports = ((node/*: any*/)/*: Fragment<
  withProvidedVariablesTest3Fragment$fragmentType,
  withProvidedVariablesTest3Fragment$data,
>*/);
