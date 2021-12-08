/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<591b7fc6f70fbd77fc8f891605dc56c1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type fetchQueryInternalTestMarkdown1Fragment_name$fragmentType: FragmentType;
export type fetchQueryInternalTestMarkdown1Fragment_name$ref = fetchQueryInternalTestMarkdown1Fragment_name$fragmentType;
export type fetchQueryInternalTestMarkdown1Fragment_name$data = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +__typename: "MarkdownUserNameRenderer",
  +$fragmentType: fetchQueryInternalTestMarkdown1Fragment_name$fragmentType,
|};
export type fetchQueryInternalTestMarkdown1Fragment_name = fetchQueryInternalTestMarkdown1Fragment_name$data;
export type fetchQueryInternalTestMarkdown1Fragment_name$key = {
  +$data?: fetchQueryInternalTestMarkdown1Fragment_name$data,
  +$fragmentSpreads: fetchQueryInternalTestMarkdown1Fragment_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fetchQueryInternalTestMarkdown1Fragment_name",
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
  (node/*: any*/).hash = "c23b64d2c536a5ff15a088b0ad49e3b9";
}

module.exports = ((node/*: any*/)/*: Fragment<
  fetchQueryInternalTestMarkdown1Fragment_name$fragmentType,
  fetchQueryInternalTestMarkdown1Fragment_name$data,
>*/);
