/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<49ce5d9d4374a248d236645aaa3c04cc>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type fetchQueryInternalTestPlainFragment_name$fragmentType: FragmentType;
export type fetchQueryInternalTestPlainFragment_name$data = {
  readonly data: ?{
    readonly text: ?string,
  },
  readonly plaintext: ?string,
  readonly $fragmentType: fetchQueryInternalTestPlainFragment_name$fragmentType,
};
export type fetchQueryInternalTestPlainFragment_name$key = {
  readonly $data?: fetchQueryInternalTestPlainFragment_name$data,
  readonly $fragmentSpreads: fetchQueryInternalTestPlainFragment_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fetchQueryInternalTestPlainFragment_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "plaintext",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PlainUserNameData",
      "kind": "LinkedField",
      "name": "data",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "28987f688adc6c61dc29867c5efdef79";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  fetchQueryInternalTestPlainFragment_name$fragmentType,
  fetchQueryInternalTestPlainFragment_name$data,
>*/);
