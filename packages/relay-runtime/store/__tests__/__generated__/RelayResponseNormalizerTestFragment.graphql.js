/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ba042d9f6f8a77c1b8c44bdfe307e266>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayResponseNormalizerTestFragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayResponseNormalizerTestMarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayResponseNormalizerTestPlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayResponseNormalizerTestMarkdownUserNameRenderer_name$fragmentType } from "./RelayResponseNormalizerTestMarkdownUserNameRenderer_name.graphql";
import type { RelayResponseNormalizerTestPlainUserNameRenderer_name$fragmentType } from "./RelayResponseNormalizerTestPlainUserNameRenderer_name.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTestFragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTestFragment$data = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: RelayResponseNormalizerTestMarkdownUserNameRenderer_name$fragmentType & RelayResponseNormalizerTestPlainUserNameRenderer_name$fragmentType,
  |},
  +$fragmentType: RelayResponseNormalizerTestFragment$fragmentType,
|};
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
          "value": "34hjiS"
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
      "storageKey": "nameRenderer(supported:\"34hjiS\")"
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
