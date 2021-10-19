/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3ea1f5a2fa2af2b14d8e50b8396f934b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type DataCheckerTestMarkdownUserNameRenderer_nameFragment$ref: FragmentReference;
declare export opaque type DataCheckerTestMarkdownUserNameRenderer_nameFragment$fragmentType: DataCheckerTestMarkdownUserNameRenderer_nameFragment$ref;
export type DataCheckerTestMarkdownUserNameRenderer_nameFragment = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$refType: DataCheckerTestMarkdownUserNameRenderer_nameFragment$ref,
|};
export type DataCheckerTestMarkdownUserNameRenderer_nameFragment$data = DataCheckerTestMarkdownUserNameRenderer_nameFragment;
export type DataCheckerTestMarkdownUserNameRenderer_nameFragment$key = {
  +$data?: DataCheckerTestMarkdownUserNameRenderer_nameFragment$data,
  +$fragmentRefs: DataCheckerTestMarkdownUserNameRenderer_nameFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTestMarkdownUserNameRenderer_nameFragment",
  "selections": [
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
      "concreteType": "MarkdownUserNameData",
      "kind": "LinkedField",
      "name": "data",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "markup",
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
  (node/*: any*/).hash = "820d8b5dec3d3a5e954443aaa7c73b0d";
}

module.exports = node;
