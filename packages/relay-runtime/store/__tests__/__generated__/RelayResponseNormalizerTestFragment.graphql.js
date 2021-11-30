/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e50fc140439980b6ad0daa70706b17f5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayResponseNormalizerTestFragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayResponseNormalizerTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayResponseNormalizerTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayResponseNormalizerTestMarkdownUserNameRenderer_name$fragmentType = any;
type RelayResponseNormalizerTestPlainUserNameRenderer_name$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTestFragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTestFragment$ref = RelayResponseNormalizerTestFragment$fragmentType;
export type RelayResponseNormalizerTestFragment$data = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: RelayResponseNormalizerTestPlainUserNameRenderer_name$fragmentType & RelayResponseNormalizerTestMarkdownUserNameRenderer_name$fragmentType,
  |},
  +$fragmentType: RelayResponseNormalizerTestFragment$fragmentType,
|};
export type RelayResponseNormalizerTestFragment = RelayResponseNormalizerTestFragment$data;
export type RelayResponseNormalizerTestFragment$key = {
  +$data?: RelayResponseNormalizerTestFragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTestFragment",
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
      "args": [
        {
          "kind": "Literal",
          "name": "supported",
          "value": [
            "PlainUserNameRenderer",
            "MarkdownUserNameRenderer"
          ]
        }
      ],
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
              "documentName": "RelayResponseNormalizerTestFragment",
              "fragmentName": "RelayResponseNormalizerTestPlainUserNameRenderer_name",
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
              "documentName": "RelayResponseNormalizerTestFragment",
              "fragmentName": "RelayResponseNormalizerTestMarkdownUserNameRenderer_name",
              "fragmentPropName": "name",
              "kind": "ModuleImport"
            }
          ],
          "type": "MarkdownUserNameRenderer",
          "abstractKey": null
        }
      ],
      "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "59a69fffc6df53f032474b10299424b4";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTestFragment$fragmentType,
  RelayResponseNormalizerTestFragment$data,
>*/);
