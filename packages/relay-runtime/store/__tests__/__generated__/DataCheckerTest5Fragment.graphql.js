/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0c1bf3129a48296eafcb392481e7d8e5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency DataCheckerTest5Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"DataCheckerTest5MarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"DataCheckerTest5PlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type DataCheckerTest5MarkdownUserNameRenderer_name$fragmentType = any;
type DataCheckerTest5PlainUserNameRenderer_name$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest5Fragment$fragmentType: FragmentType;
export type DataCheckerTest5Fragment$ref = DataCheckerTest5Fragment$fragmentType;
export type DataCheckerTest5Fragment$data = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: DataCheckerTest5PlainUserNameRenderer_name$fragmentType & DataCheckerTest5MarkdownUserNameRenderer_name$fragmentType,
  |},
  +$fragmentType: DataCheckerTest5Fragment$fragmentType,
|};
export type DataCheckerTest5Fragment = DataCheckerTest5Fragment$data;
export type DataCheckerTest5Fragment$key = {
  +$data?: DataCheckerTest5Fragment$data,
  +$fragmentSpreads: DataCheckerTest5Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest5Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
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
              "documentName": "DataCheckerTest5Fragment",
              "fragmentName": "DataCheckerTest5PlainUserNameRenderer_name",
              "fragmentPropName": "name",
              "kind": "ModuleImport"
            }
          ],
          "type": "PlainUserNameRenderer",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "args": null,
              "documentName": "DataCheckerTest5Fragment",
              "fragmentName": "DataCheckerTest5MarkdownUserNameRenderer_name",
              "fragmentPropName": "name",
              "kind": "ModuleImport"
            }
          ],
          "type": "MarkdownUserNameRenderer",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "8a7920a2a8ae8065ddf4b46a76f2199c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest5Fragment$fragmentType,
  DataCheckerTest5Fragment$data,
>*/);
