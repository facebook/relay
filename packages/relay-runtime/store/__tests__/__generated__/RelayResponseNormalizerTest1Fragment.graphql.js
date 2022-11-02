/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d0a75647e27de09b6bdccb708f5bab4f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayResponseNormalizerTest1Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayResponseNormalizerTest1PlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$fragmentType } from "./RelayResponseNormalizerTest1MarkdownUserNameRenderer_name.graphql";
import type { RelayResponseNormalizerTest1PlainUserNameRenderer_name$fragmentType } from "./RelayResponseNormalizerTest1PlainUserNameRenderer_name.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest1Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest1Fragment$data = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentSpreads: RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$fragmentType & RelayResponseNormalizerTest1PlainUserNameRenderer_name$fragmentType,
  |},
  +$fragmentType: RelayResponseNormalizerTest1Fragment$fragmentType,
|};
export type RelayResponseNormalizerTest1Fragment$key = {
  +$data?: RelayResponseNormalizerTest1Fragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest1Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest1Fragment",
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
              "documentName": "RelayResponseNormalizerTest1Fragment",
              "fragmentName": "RelayResponseNormalizerTest1PlainUserNameRenderer_name",
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
              "documentName": "RelayResponseNormalizerTest1Fragment",
              "fragmentName": "RelayResponseNormalizerTest1MarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "61ca2484fc5e99738b6a8aa2aa184c22";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest1Fragment$fragmentType,
  RelayResponseNormalizerTest1Fragment$data,
>*/);
