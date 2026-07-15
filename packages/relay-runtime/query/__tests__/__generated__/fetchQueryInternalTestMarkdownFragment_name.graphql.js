/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<03abb0bf8058d18f4cc6e6559e9a057c>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type fetchQueryInternalTestMarkdownFragment_name$fragmentType: FragmentType;
export type fetchQueryInternalTestMarkdownFragment_name$data = {
  readonly __typename: "MarkdownUserNameRenderer",
  readonly data: ?{
    readonly markup: ?string,
  },
  readonly markdown: ?string,
  readonly $fragmentType: fetchQueryInternalTestMarkdownFragment_name$fragmentType,
};
export type fetchQueryInternalTestMarkdownFragment_name$key = {
  readonly $data?: fetchQueryInternalTestMarkdownFragment_name$data,
  readonly $fragmentSpreads: fetchQueryInternalTestMarkdownFragment_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fetchQueryInternalTestMarkdownFragment_name",
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
  (node/*:: as any*/).hash = "c2edebb9e00de6001cf648d7924dff03";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  fetchQueryInternalTestMarkdownFragment_name$fragmentType,
  fetchQueryInternalTestMarkdownFragment_name$data,
>*/);
