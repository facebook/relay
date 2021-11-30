/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6ffe312f9e261ebf2c661346ea021b13>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name.user.innerRenderer {"branches":{"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$ref = RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$fragmentType;
export type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$data = {|
  +markdown: ?string,
  +user: ?{|
    +name: ?string,
    +innerRenderer: ?{|
      +__fragmentPropName?: ?string,
      +__module_component?: ?string,
      +$fragmentSpreads: RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$fragmentType,
    |},
  |},
  +__typename: "MarkdownUserNameRenderer",
  +$fragmentType: RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name = RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$data;
export type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "markdown",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "user",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": "innerRenderer",
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "nameRenderer",
          "plural": false,
          "selections": [
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": null,
                  "documentName": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name",
                  "fragmentName": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name",
                  "fragmentPropName": "name",
                  "kind": "ModuleImport"
                }
              ],
              "type": "PlainUserNameRenderer",
              "abstractKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "e1edea1a63722ab6ea297694773c329c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$data,
>*/);
