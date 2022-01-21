/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<108f05daf7a4ead6d302b7579543e827>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type withProvidedVariablesTest4Fragment1$fragmentType: FragmentType;
export type withProvidedVariablesTest4Fragment1$ref = withProvidedVariablesTest4Fragment1$fragmentType;
export type withProvidedVariablesTest4Fragment1$data = {|
  +friends: ?{|
    +count: ?number,
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +name?: ?string,
      |},
    |}>,
  |},
  +$fragmentType: withProvidedVariablesTest4Fragment1$fragmentType,
|};
export type withProvidedVariablesTest4Fragment1 = withProvidedVariablesTest4Fragment1$data;
export type withProvidedVariablesTest4Fragment1$key = {
  +$data?: withProvidedVariablesTest4Fragment1$data,
  +$fragmentSpreads: withProvidedVariablesTest4Fragment1$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__provideIncludeUserNames"
    },
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__provideNumberOfFriends"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "withProvidedVariablesTest4Fragment1",
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
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "count",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "FriendsEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "condition": "__relay_internal__pv__provideIncludeUserNames",
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
                }
              ],
              "storageKey": null
            }
          ],
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
  (node/*: any*/).hash = "81b43835e99f6c49563ff17157a8a430";
}

module.exports = ((node/*: any*/)/*: Fragment<
  withProvidedVariablesTest4Fragment1$fragmentType,
  withProvidedVariablesTest4Fragment1$data,
>*/);
