/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b934e9f6b3a6235c384ab2ee577094d9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type DataCheckerTest5MarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type DataCheckerTest5MarkdownUserNameRenderer_name$fragmentType: DataCheckerTest5MarkdownUserNameRenderer_name$ref;
export type DataCheckerTest5MarkdownUserNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string
  |},
  +$refType: DataCheckerTest5MarkdownUserNameRenderer_name$ref,
|};
export type DataCheckerTest5MarkdownUserNameRenderer_name$data = DataCheckerTest5MarkdownUserNameRenderer_name;
export type DataCheckerTest5MarkdownUserNameRenderer_name$key = {
  +$data?: DataCheckerTest5MarkdownUserNameRenderer_name$data,
  +$fragmentRefs: DataCheckerTest5MarkdownUserNameRenderer_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest5MarkdownUserNameRenderer_name",
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
  (node/*: any*/).hash = "a4dd0ea908e618332756ce61165bc6c0";
}

module.exports = node;
