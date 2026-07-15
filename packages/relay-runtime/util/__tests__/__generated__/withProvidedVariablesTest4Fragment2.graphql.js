/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<241ebca366923c282a4cd2ad4ced21d9>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type withProvidedVariablesTest4Fragment2$fragmentType: FragmentType;
export type withProvidedVariablesTest4Fragment2$data = {
  readonly name?: ?string,
  readonly $fragmentType: withProvidedVariablesTest4Fragment2$fragmentType,
};
export type withProvidedVariablesTest4Fragment2$key = {
  readonly $data?: withProvidedVariablesTest4Fragment2$data,
  readonly $fragmentSpreads: withProvidedVariablesTest4Fragment2$fragmentType,
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
  (node/*:: as any*/).hash = "c0c6f85a01d78ddf92c908529c91a42b";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  withProvidedVariablesTest4Fragment2$fragmentType,
  withProvidedVariablesTest4Fragment2$data,
>*/);
