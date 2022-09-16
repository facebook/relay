/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<47f19384c99b188960c9998b659e4e39>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type withProvidedVariablesTest4Fragment2$fragmentType: FragmentType;
export type withProvidedVariablesTest4Fragment2$data = {|
  +name?: ?string,
  +$fragmentType: withProvidedVariablesTest4Fragment2$fragmentType,
|};
export type withProvidedVariablesTest4Fragment2$key = {
  +$data?: withProvidedVariablesTest4Fragment2$data,
  +$fragmentSpreads: withProvidedVariablesTest4Fragment2$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__provideIncludeUserNamesrelayprovider"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "withProvidedVariablesTest4Fragment2",
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
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "b116f37b4c85782457ef922357be1e96";
}

module.exports = ((node/*: any*/)/*: Fragment<
  withProvidedVariablesTest4Fragment2$fragmentType,
  withProvidedVariablesTest4Fragment2$data,
>*/);
