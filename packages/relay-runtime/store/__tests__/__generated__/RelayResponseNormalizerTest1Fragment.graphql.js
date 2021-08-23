/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<72ddaae50cdf5a582a60048cf2614ec7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayResponseNormalizerTest1Fragment.nameRenderer {"branches":{"MarkdownUserNameRenderer":{"component":"MarkdownUserNameRenderer.react","fragment":"RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$normalization.graphql"},"PlainUserNameRenderer":{"component":"PlainUserNameRenderer.react","fragment":"RelayResponseNormalizerTest1PlainUserNameRenderer_name$normalization.graphql"}},"plural":false}

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$ref = any;
type RelayResponseNormalizerTest1PlainUserNameRenderer_name$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest1Fragment$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTest1Fragment$fragmentType: RelayResponseNormalizerTest1Fragment$ref;
export type RelayResponseNormalizerTest1Fragment = {|
  +id: string,
  +nameRenderer: ?{|
    +__fragmentPropName?: ?string,
    +__module_component?: ?string,
    +$fragmentRefs: RelayResponseNormalizerTest1PlainUserNameRenderer_name$ref & RelayResponseNormalizerTest1MarkdownUserNameRenderer_name$ref,
  |},
  +$refType: RelayResponseNormalizerTest1Fragment$ref,
|};
export type RelayResponseNormalizerTest1Fragment$data = RelayResponseNormalizerTest1Fragment;
export type RelayResponseNormalizerTest1Fragment$key = {
  +$data?: RelayResponseNormalizerTest1Fragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest1Fragment$ref,
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

module.exports = node;
