/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<79cfd1aa462fa1625baaea91b7e7dd2f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type withProvidedVariablesTest5Fragment$fragmentType: FragmentType;
export type withProvidedVariablesTest5Fragment$data = {|
  +other_picture: ?{|
    +uri: ?string,
  |},
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: withProvidedVariablesTest5Fragment$fragmentType,
|};
export type withProvidedVariablesTest5Fragment$key = {
  +$data?: withProvidedVariablesTest5Fragment$data,
  +$fragmentSpreads: withProvidedVariablesTest5Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "uri",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__provideRandomNumber_invalid1relayprovider"
    },
    {
      "kind": "RootArgument",
      "name": "__relay_internal__pv__provideRandomNumber_invalid2relayprovider"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "withProvidedVariablesTest5Fragment",
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
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": "other_picture",
      "args": [
        {
          "kind": "Variable",
          "name": "scale",
          "variableName": "__relay_internal__pv__provideRandomNumber_invalid2relayprovider"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6e08f5797205b7b5bb2a77db4e738fd9";
}

module.exports = ((node/*: any*/)/*: Fragment<
  withProvidedVariablesTest5Fragment$fragmentType,
  withProvidedVariablesTest5Fragment$data,
>*/);
