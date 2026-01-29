/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ccd1452c39f1571f8018d417f5e30ae2>>
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
export type withProvidedVariablesTest4Fragment1$data = {|
  +friends: ?{|
    +count: ?number,
    +edges: ?ReadonlyArray<?{|
      +node: ?{|
        +name?: ?string,
      |},
    |}>,
  |},
  +$fragmentType: withProvidedVariablesTest4Fragment1$fragmentType,
|};
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
      "name": "__relay_internal__pv__provideIncludeUserNamesrelayprovider"
    },
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__provideNumberOfFriendsrelayprovider"
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
  (node/*: any*/).hash = "baf15ae7a351b348d7cee1b65067a19e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  withProvidedVariablesTest4Fragment1$fragmentType,
  withProvidedVariablesTest4Fragment1$data,
>*/);
