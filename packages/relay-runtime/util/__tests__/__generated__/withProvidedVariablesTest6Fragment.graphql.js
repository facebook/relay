/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2831d4fae5bb137e90075d8bdf059f83>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type withProvidedVariablesTest6Fragment$fragmentType: FragmentType;
export type withProvidedVariablesTest6Fragment$data = {|
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: withProvidedVariablesTest6Fragment$fragmentType,
|};
export type withProvidedVariablesTest6Fragment$key = {
  +$data?: withProvidedVariablesTest6Fragment$data,
  +$fragmentSpreads: withProvidedVariablesTest6Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__provideRandomNumber_invalid1relayprovider"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "withProvidedVariablesTest6Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "scale",
          "variableName": "__relay_internal__pv__provideRandomNumber_invalid1relayprovider"
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
  (node/*: any*/).hash = "b85fa906927acb5781aa7b0a9a1fc177";
}

module.exports = ((node/*: any*/)/*: Fragment<
  withProvidedVariablesTest6Fragment$fragmentType,
  withProvidedVariablesTest6Fragment$data,
>*/);
