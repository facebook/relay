/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<607d0b54d3b12ed9c8ce94abadee6a14>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type fetchQueryInternalTestMarkdown1Fragment_name$fragmentType: FragmentType;
export type fetchQueryInternalTestMarkdown1Fragment_name$data = {
  readonly __typename: "MarkdownUserNameRenderer",
  readonly data: ?{
    readonly markup: ?string,
  },
  readonly markdown: ?string,
  readonly $fragmentType: fetchQueryInternalTestMarkdown1Fragment_name$fragmentType,
};
export type fetchQueryInternalTestMarkdown1Fragment_name$key = {
  readonly $data?: fetchQueryInternalTestMarkdown1Fragment_name$data,
  readonly $fragmentSpreads: fetchQueryInternalTestMarkdown1Fragment_name$fragmentType,
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
  (node/*:: as any*/).hash = "c23b64d2c536a5ff15a088b0ad49e3b9";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  fetchQueryInternalTestMarkdown1Fragment_name$fragmentType,
  fetchQueryInternalTestMarkdown1Fragment_name$data,
>*/);
