/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4fb3103439bd92c7715fb9fdaec67031>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$ref = RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$fragmentType;
export type RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$data = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name = RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$data;
export type RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name",
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
  (node/*: any*/).hash = "b26eedaf9a301741f224ad486c5af66f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteWithModuleTestPlainUserNameRenderer_name$data,
>*/);
