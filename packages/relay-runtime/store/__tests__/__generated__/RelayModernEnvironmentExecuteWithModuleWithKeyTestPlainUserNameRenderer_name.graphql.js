/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<080c6dd739dbc852222aeb02ee352300>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name$data = {|
  +data: ?{|
    +text: ?string,
  |},
  +plaintext: ?string,
  +$fragmentType: RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "plaintext",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PlainUserNameData",
      "kind": "LinkedField",
      "name": "data",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "7c1010ea945368e73772ffc0c72399a3";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name$data,
>*/);
