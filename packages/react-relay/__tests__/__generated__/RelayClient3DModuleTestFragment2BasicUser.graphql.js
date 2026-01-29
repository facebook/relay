/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b02938a2c92a92281b656db7309a3d4b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayClient3DModuleTestFragment2BasicUser.basicUser {"branches":{"ClientUser":{"component":"ClientUser.react","fragment":"RelayClient3DModuleTestFragmentClientUser_data$normalization.graphql"},"SpecialUser":{"component":"SpecialUser.react","fragment":"RelayClient3DModuleTestFragmentSpecialUser_data$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayClient3DModuleTestFragmentClientUser_data$fragmentType } from "./RelayClient3DModuleTestFragmentClientUser_data.graphql";
import type { RelayClient3DModuleTestFragmentSpecialUser_data$fragmentType } from "./RelayClient3DModuleTestFragmentSpecialUser_data.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayClient3DModuleTestFragment2BasicUser$fragmentType: FragmentType;
export type RelayClient3DModuleTestFragment2BasicUser$data = {|
  +basicUser: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: RelayClient3DModuleTestFragmentClientUser_data$fragmentType & RelayClient3DModuleTestFragmentSpecialUser_data$fragmentType,
  |},
  +$fragmentType: RelayClient3DModuleTestFragment2BasicUser$fragmentType,
|};
export type RelayClient3DModuleTestFragment2BasicUser$key = {
  +$data?: RelayClient3DModuleTestFragment2BasicUser$data,
  +$fragmentSpreads: RelayClient3DModuleTestFragment2BasicUser$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayClient3DModuleTestFragment2BasicUser",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "basicUser",
          "plural": false,
          "selections": [
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": null,
                  "documentName": "RelayClient3DModuleTestFragment2BasicUser",
                  "fragmentName": "RelayClient3DModuleTestFragmentClientUser_data",
                  "fragmentPropName": "data",
                  "kind": "ModuleImport",
                  "componentModuleProvider": () => require('./../ClientUser.react')
                }
              ],
              "type": "ClientUser",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": null,
                  "documentName": "RelayClient3DModuleTestFragment2BasicUser",
                  "fragmentName": "RelayClient3DModuleTestFragmentSpecialUser_data",
                  "fragmentPropName": "data",
                  "kind": "ModuleImport",
                  "componentModuleProvider": () => require('./../SpecialUser.react')
                }
              ],
              "type": "SpecialUser",
              "abstractKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "Persona",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "184cda21aa0baef6ed005c5bc2e07c07";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayClient3DModuleTestFragment2BasicUser$fragmentType,
  RelayClient3DModuleTestFragment2BasicUser$data,
>*/);
