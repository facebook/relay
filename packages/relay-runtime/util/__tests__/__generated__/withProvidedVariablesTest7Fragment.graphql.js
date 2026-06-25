/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<62044c0b8f32381d18157a0cb71deb48>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type withProvidedVariablesTest7Fragment$fragmentType: FragmentType;
export type withProvidedVariablesTest7Fragment$data = {
  readonly profile_picture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: withProvidedVariablesTest7Fragment$fragmentType,
};
export type withProvidedVariablesTest7Fragment$key = {
  readonly $data?: withProvidedVariablesTest7Fragment$data,
  readonly $fragmentSpreads: withProvidedVariablesTest7Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__provideDynamicValuerelayprovider"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "withProvidedVariablesTest7Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "scale",
          "variableName": "__relay_internal__pv__provideDynamicValuerelayprovider"
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
  (node/*:: as any*/).hash = "37a45014ce2e2e58371a52a5429eaf90";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  withProvidedVariablesTest7Fragment$fragmentType,
  withProvidedVariablesTest7Fragment$data,
>*/);
